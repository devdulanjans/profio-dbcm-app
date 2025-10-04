import { Schema, model, Document, Types } from "mongoose";

export interface IContact extends Document {
  _id: Types.ObjectId;
  user_id: string;      // Who saved the contact (e.g., John)
  profile_id: string;   // Whose profile was saved (e.g., Kevin’s profile)
  template_id?: string; // Optional: Which template was used
  saved_at: Date;
  profile_details: {
    name: { langCode: string; value: string }[];
    email: string;
    phone: string;
  };
}

const contactSchema = new Schema<IContact>({
  user_id: { type: String, ref: "User", required: true },
  profile_id: { type: String, ref: "User", required: true },
  template_id: { type: String, ref: "Template", required: true },
  saved_at: { type: Date, default: Date.now },
  profile_details: {
    name: { type: [{ langCode: String, value: String }], required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
});

export default model<IContact>("Contact", contactSchema, "contact");