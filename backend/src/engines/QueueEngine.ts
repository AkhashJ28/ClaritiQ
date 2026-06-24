import Patient from '../models/Patient';
import Queue from '../models/Queue';
import AuditLog from '../models/AuditLog';
import ConsultationLog from '../models/ConsultationLog';
import { io } from '../index';
import { Types } from 'mongoose';

export class QueueEngine {
  static activeTimeouts = new Map<number, NodeJS.Timeout>();

  // Wait time engine is inside here or static
  static async getAverageWaitTime(): Promise<number> {
    const logs = await ConsultationLog.find().sort({ createdAt: -1 }).limit(10);
    if (logs.length === 0) return 10; // Default 10 mins
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
    const updatedQueue = await Queue.findByIdAndUpdate('global_queue', { $inc: { currentTokenNumber: 1 } }, { new: true });
    const nextToken = updatedQueue!.currentTokenNumber;

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

    const targetPatient = patients[0];
    if (!targetPatient) throw new Error('Queue is empty');

    const nextPatient = await Patient.findOneAndUpdate(
      { _id: targetPatient._id, status: 'WAITING' },
      { status: 'SERVING', servingStartedAt: new Date() },
      { new: true }
    );

    if (!nextPatient) throw new Error('Queue is empty or patient already called');

    const globalQueue = await Queue.findById('global_queue');

    // Update the currently serving patient to COMPLETED if any
    if (globalQueue?.servingTokenNumber) {
      const prev = await Patient.findOne({ tokenNumber: globalQueue.servingTokenNumber });
      if (prev && prev.status === 'SERVING') {
        prev.status = 'COMPLETED';
        await prev.save();
        
        // Clear any existing auto-complete timeout for the previous patient
        if (this.activeTimeouts.has(prev.tokenNumber)) {
          clearTimeout(this.activeTimeouts.get(prev.tokenNumber));
          this.activeTimeouts.delete(prev.tokenNumber);
        }
        
        let duration = 10; // Default fallback
        if (prev.servingStartedAt) {
          duration = Math.round((Date.now() - prev.servingStartedAt.getTime()) / 60000);
          if (duration < 1) duration = 1; // Minimum 1 minute
        }

        await ConsultationLog.create({
          tokenNumber: prev.tokenNumber,
          patientId: prev._id,
          startTime: prev.servingStartedAt || new Date(Date.now() - duration * 60000),
          endTime: new Date(),
          durationMinutes: duration
        });
      }
    }

    await Queue.findByIdAndUpdate('global_queue', { servingTokenNumber: nextPatient.tokenNumber });

    // Check if this is the last person in the queue (no more WAITING patients)
    const remainingWaiting = await Patient.countDocuments({ status: 'WAITING' });
    if (remainingWaiting === 0) {
      // This is the last person — set auto-completion timeout using estimated average wait time
      const avgWait = await this.getAverageWaitTime();
      const timeout = setTimeout(() => {
        this.autoCompletePatient(nextPatient.tokenNumber, avgWait).catch(console.error);
      }, avgWait * 60000);
      this.activeTimeouts.set(nextPatient.tokenNumber, timeout);
    }

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

  static async autoCompletePatient(tokenNumber: number, expectedDuration: number) {
    const globalQueue = await Queue.findById('global_queue');
    if (globalQueue?.servingTokenNumber === tokenNumber) {
      const patient = await Patient.findOne({ tokenNumber });
      if (patient && patient.status === 'SERVING') {
        patient.status = 'COMPLETED';
        await patient.save();

        await ConsultationLog.create({
          tokenNumber: patient.tokenNumber,
          patientId: patient._id,
          startTime: patient.servingStartedAt || new Date(Date.now() - expectedDuration * 60000),
          endTime: new Date(),
          durationMinutes: expectedDuration
        });
        
        await Queue.findByIdAndUpdate('global_queue', { servingTokenNumber: null });
        
        await AuditLog.create({
          action: 'AUTO_COMPLETE',
          tokenNumber: patient.tokenNumber,
          patientId: patient._id,
          actor: 'System',
          details: `Token #${tokenNumber} auto-completed after ${expectedDuration} mins.`
        });

        const state = await this.getQueueState();
        io.emit('QUEUE_UPDATED', state);
        io.emit('CALL_NEXT', null); // clear current serving on UI
      }
    }
    this.activeTimeouts.delete(tokenNumber);
  }
}
