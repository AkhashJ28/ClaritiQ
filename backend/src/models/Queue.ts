import mongoose, { Schema, Document } from 'mongoose';

export interface IQueue extends Document<string> {
  _id: string; // "global_queue"
  currentTokenNumber: number; // The latest generated token number
  servingTokenNumber: number | null; // The token currently being served
}

const QueueSchema: Schema = new Schema(
  {
    _id: { type: String, default: 'global_queue' },
    currentTokenNumber: { type: Number, default: 0 },
    servingTokenNumber: { type: Number, default: null }
  },
  { timestamps: true }
);

export default mongoose.model<IQueue>('Queue', QueueSchema);
