import mongoose from 'mongoose';
import Patient from '../models/Patient';
import Queue from '../models/Queue';
import ConsultationLog from '../models/ConsultationLog';
import AuditLog from '../models/AuditLog';

export async function seedDatabase() {
  const existingQueue = await Queue.findById('global_queue');
  if (existingQueue) {
    console.log('Database already seeded. Skipping.');
    return;
  }

  console.log('Seeding demo data...');

  // Create queue state
  const queue = await Queue.create({
    _id: 'global_queue',
    currentTokenNumber: 28, // Up to 28 has been generated
    servingTokenNumber: 23
  });

  const baseDate = new Date();

  // Create Patient 23 (Serving)
  const p23 = await Patient.create({
    name: 'Rahul Verma',
    mobileNumber: '9876543210',
    priorityLevel: 'NORMAL',
    status: 'SERVING',
    tokenNumber: 23,
    createdAt: new Date(baseDate.getTime() - 40 * 60000)
  });

  // Create Waiting Patients 24 to 28
  const names = ['Anjali Patel', 'Suresh Kumar', 'Neha Singh', 'Arjun Mehta', 'Kavita Joshi'];
  for (let i = 0; i < names.length; i++) {
    const token = 24 + i;
    await Patient.create({
      name: names[i],
      priorityLevel: i === 1 ? 'PRIORITY' : 'NORMAL', // Make Suresh priority
      status: 'WAITING',
      tokenNumber: token,
      createdAt: new Date(baseDate.getTime() - (35 - i * 5) * 60000)
    });
  }

  // Create some history (Patients 1 to 22)
  for (let i = 1; i <= 5; i++) {
    const token = 23 - i;
    const dur = 6 + Math.floor(Math.random() * 5); // 6 to 10 mins
    const p = await Patient.create({
      name: `Past Patient ${token}`,
      priorityLevel: 'NORMAL',
      status: 'COMPLETED',
      tokenNumber: token,
      createdAt: new Date(baseDate.getTime() - (80 + i * 15) * 60000)
    });

    await ConsultationLog.create({
      tokenNumber: token,
      patientId: p._id,
      startTime: new Date(baseDate.getTime() - (60 + i * 15) * 60000),
      endTime: new Date(baseDate.getTime() - (60 + i * 15 - dur) * 60000),
      durationMinutes: dur
    });
  }

  await AuditLog.create({
    action: 'SYSTEM_START',
    actor: 'System',
    details: 'Database seeded with demo data.'
  });

  console.log('Seeding complete.');
}
