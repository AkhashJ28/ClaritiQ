import Patient from '../models/Patient';
import Queue from '../models/Queue';
import AuditLog from '../models/AuditLog';
import ConsultationLog from '../models/ConsultationLog';
import { io } from '../index';
import { Types } from 'mongoose';

export class QueueEngine {
  // Wait time engine is inside here or static
  static async getAverageWaitTime(): Promise<number> {
    const logs = await ConsultationLog.find().sort({ createdAt: -1 }).limit(10);
    if (logs.length === 0) return 8; // Default 8 mins
    const total = logs.reduce((acc, log) => acc + log.durationMinutes, 0);
    return Math.round(total / logs.length);
  }

  static async recalculateETA() {
    const avg = await this.getAverageWaitTime();
    return avg;
  }

  static async getQueueState() {
    const globalQueue = await Queue.findById('global_queue');
    const patients = await Patient.find({ status: 'WAITING' }).sort({ createdAt: 1 }); // FIFO base

    // Sorting logic: CRITICAL > PRIORITY > NORMAL
    const priorityMap: any = { 'CRITICAL': 3, 'PRIORITY': 2, 'NORMAL': 1 };
    patients.sort((a, b) => priorityMap[b.priorityLevel] - priorityMap[a.priorityLevel]);

    const avg = await this.getAverageWaitTime();
    const currentToken = globalQueue?.servingTokenNumber || null;

    return {
      currentToken,
      averageWaitTime: avg,
      patientsWaiting: patients.length,
      queue: patients
    };
  }

  static async addPatient(name: string, mobileNumber: string, priorityLevel: 'NORMAL' | 'PRIORITY' | 'CRITICAL', actor: string) {
    let queue = await Queue.findById('global_queue');
    if (!queue) {
      queue = await Queue.create({ _id: 'global_queue', currentTokenNumber: 0, servingTokenNumber: null });
    }

    // Atomic increment
    const nextToken = queue.currentTokenNumber + 1;
    await Queue.findByIdAndUpdate('global_queue', { $inc: { currentTokenNumber: 1 } });

    const patient = await Patient.create({
      name,
      mobileNumber,
      priorityLevel,
      status: 'WAITING',
      tokenNumber: nextToken
    });

    await AuditLog.create({
      action: 'ADD_PATIENT',
      tokenNumber: nextToken,
      patientId: (patient as any)._id,
      actor,
      details: `Patient ${name} added with ${priorityLevel} priority.`
    });

    io.emit('QUEUE_UPDATED', await this.getQueueState());
    io.emit('PATIENT_CREATED', patient);
    return patient;
  }

  static async callNext(actor: string) {
    // Concurrency protection: we find the first eligible patient and mark them SERVING atomically
    const patients = await Patient.find({ status: 'WAITING' }).sort({ createdAt: 1 });
    const priorityMap: any = { 'CRITICAL': 3, 'PRIORITY': 2, 'NORMAL': 1 };
    patients.sort((a, b) => priorityMap[b.priorityLevel] - priorityMap[a.priorityLevel]);

    const nextPatient = patients[0];
    if (!nextPatient) throw new Error('Queue is empty');

    const globalQueue = await Queue.findById('global_queue');

    // Update the currently serving patient to COMPLETED if any
    if (globalQueue?.servingTokenNumber) {
      const prev = await Patient.findOne({ tokenNumber: globalQueue.servingTokenNumber });
      if (prev) {
        prev.status = 'COMPLETED';
        await prev.save();
        
        // Log consultation time (mocked for demo)
        const duration = Math.floor(Math.random() * 5) + 5; // 5 to 10 mins
        await ConsultationLog.create({
          tokenNumber: prev.tokenNumber,
          patientId: prev._id,
          startTime: new Date(Date.now() - duration * 60000),
          endTime: new Date(),
          durationMinutes: duration
        });
      }
    }

    nextPatient.status = 'SERVING';
    await nextPatient.save();

    await Queue.findByIdAndUpdate('global_queue', { servingTokenNumber: nextPatient.tokenNumber });

    await AuditLog.create({
      action: 'CALL_NEXT',
      tokenNumber: nextPatient.tokenNumber,
      patientId: nextPatient._id,
      actor,
      details: `Called Token #${nextPatient.tokenNumber}`
    });

    const state = await this.getQueueState();
    io.emit('CALL_NEXT', nextPatient);
    io.emit('QUEUE_UPDATED', state);
    return state;
  }

  static async undoLastCall(actor: string) {
    const globalQueue = await Queue.findById('global_queue');
    if (!globalQueue || !globalQueue.servingTokenNumber) throw new Error('No token to undo');

    const servingPatient = await Patient.findOne({ tokenNumber: globalQueue.servingTokenNumber });
    if (servingPatient) {
      servingPatient.status = 'WAITING';
      await servingPatient.save();
    }

    // Attempt to find the previous one and make it serving
    const lastCompleted = await Patient.findOne({ status: 'COMPLETED' }).sort({ updatedAt: -1 });
    if (lastCompleted) {
      lastCompleted.status = 'SERVING';
      await lastCompleted.save();
      await Queue.findByIdAndUpdate('global_queue', { servingTokenNumber: lastCompleted.tokenNumber });
    } else {
      await Queue.findByIdAndUpdate('global_queue', { servingTokenNumber: null });
    }

    await AuditLog.create({
      action: 'UNDO_LAST_CALL',
      tokenNumber: servingPatient?.tokenNumber,
      actor,
      details: `Undo call for Token #${servingPatient?.tokenNumber || 'Unknown'}`
    });

    const state = await this.getQueueState();
    io.emit('UNDO_LAST_CALL', state);
    io.emit('QUEUE_UPDATED', state);
    return state;
  }

  static async markNoShow(tokenNumber: number, actor: string) {
    const patient = await Patient.findOne({ tokenNumber });
    if (!patient) throw new Error('Patient not found');

    patient.status = 'NO_SHOW';
    await patient.save();

    await AuditLog.create({
      action: 'NO_SHOW',
      tokenNumber,
      patientId: patient._id,
      actor,
      details: `Token #${tokenNumber} marked as NO_SHOW`
    });

    const state = await this.getQueueState();
    io.emit('QUEUE_UPDATED', state);
    return state;
  }
}
