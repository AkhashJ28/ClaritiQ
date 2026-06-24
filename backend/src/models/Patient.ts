import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  name: string;
  mobileNumber?: string;
  priorityLevel: 'NORMAL' | 'PRIORITY' | 'CRITICAL';
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'NO_SHOW';
  tokenNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    mobileNumber: { type: String, required: false },
    priorityLevel: { 
      type: String, 
      enum: ['NORMAL', 'PRIORITY', 'CRITICAL'], 
      default: 'NORMAL',
      required: true 
    },
    status: {
      type: String,
      enum: ['WAITING', 'SERVING', 'COMPLETED', 'NO_SHOW'],
      default: 'WAITING',
      required: true
    },
    tokenNumber: { type: Number, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPatient>('Patient', PatientSchema);
