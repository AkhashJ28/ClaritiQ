import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document<string> {
  _id: string; // 'global_settings'
  clinicName: string;
  defaultConsultationTime: number; // in minutes
}

const SystemSettingsSchema: Schema = new Schema(
  {
    _id: { type: String, default: 'global_settings' },
    clinicName: { type: String, default: 'QueueCure Clinic' },
    defaultConsultationTime: { type: Number, default: 8 }
  },
  { timestamps: true }
);

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);
