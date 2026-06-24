import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultationLog extends Document {
  tokenNumber: number;
  patientId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
}

const ConsultationLogSchema: Schema = new Schema(
  {
    tokenNumber: { type: Number, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IConsultationLog>('ConsultationLog', ConsultationLogSchema);
