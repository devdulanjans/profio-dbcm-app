import { Schema, model, Document, ObjectId } from "mongoose";

export interface IPayment extends Document {
  _id: ObjectId;
  userId: string;
  amount: number;
  currencyCode: string;
  status: string;
  paymentId: string;
  paymentDate: Date;
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currencyCode: { type: String, required: true },
  status: { type: String, required: true },
  paymentId: { type: String, required: true },
  paymentDate: { type: Date, required: true },
});

export default model<IPayment>("Payment", paymentSchema, "payment");
