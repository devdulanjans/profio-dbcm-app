import { Schema, model, Document, Types } from "mongoose";

export interface ISharedLink extends Document {
  templateId: string;
  token: string;
  expiresAt?: Date;
  createdAt: Date;
}

const SharedLinkSchema = new Schema<ISharedLink>({
  templateId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const SharedLink = model<ISharedLink>("SharedLink", SharedLinkSchema);
