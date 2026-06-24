import { Router, Request, Response } from 'express';
import { QueueEngine } from '../engines/QueueEngine';
import AuditLog from '../models/AuditLog';
import ConsultationLog from '../models/ConsultationLog';
import Patient from '../models/Patient';

const router = Router();

// Middleware to mock auth user
const getActor = (req: Request) => req.headers['x-user-email'] || 'System';

router.get('/queue/state', async (req, res) => {
  try {
    const state = await QueueEngine.getQueueState();
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/queue/patient', async (req, res) => {
  try {
    const { name, mobileNumber, priorityLevel } = req.body;
    const actor = getActor(req) as string;
    const patient = await QueueEngine.addPatient(name, mobileNumber, priorityLevel || 'NORMAL', actor);
    res.json(patient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/queue/call-next', async (req, res) => {
  try {
    const actor = getActor(req) as string;
    const state = await QueueEngine.callNext(actor);
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/queue/undo-last-call', async (req, res) => {
  try {
    const actor = getActor(req) as string;
    const state = await QueueEngine.undoLastCall(actor);
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/queue/no-show', async (req, res) => {
  try {
    const { tokenNumber } = req.body;
    const actor = getActor(req) as string;
    const state = await QueueEngine.markNoShow(tokenNumber, actor);
    res.json(state);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/patient/:tokenId', async (req, res) => {
  try {
    const tokenNumber = parseInt(req.params.tokenId, 10);
    const patient = await Patient.findOne({ tokenNumber });
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    const state = await QueueEngine.getQueueState();
    // Calculate estimated wait
    const waitingList = state.queue.map((p: any) => p.tokenNumber);
    const pos = waitingList.indexOf(tokenNumber);
    let patientsAhead = 0;
    let estimatedWait = 0;
    
    if (patient.status === 'SERVING') {
      estimatedWait = 0;
    } else if (pos !== -1) {
      patientsAhead = pos;
      estimatedWait = (patientsAhead + 1) * state.averageWaitTime;
    }
    
    res.json({ patient, patientsAhead, estimatedWait, averageWaitTime: state.averageWaitTime, currentToken: state.currentToken });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate('patientId');
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/consultations', async (req, res) => {
  try {
    const logs = await ConsultationLog.find().sort({ createdAt: -1 }).limit(100).populate('patientId');
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
