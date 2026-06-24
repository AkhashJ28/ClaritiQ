import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  tokenNumber?: number;
  patientId?: mongoose.Types.ObjectId;
  actor: string;
  details: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    action: { type: String, required: true },
    tokenNumber: { type: Number },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
    actor: { type: String, required: true },
    details: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
