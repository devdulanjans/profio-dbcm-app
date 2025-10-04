import AppGlobalConfig from "../models/AppGlobalConfig";
import { PaymentCreateDto } from "../dtos/PaymentCreateDto";
import Payment, { IPayment } from "../models/Payment";

export default class AppGlobalConfigRepository {

  public async create(data: PaymentCreateDto): Promise<IPayment> {
      const payment = new Payment(data);
      payment.paymentDate = new Date();
      return payment.save();
  }

  public async findByUserId(userId: string): Promise<IPayment[]> {
      return Payment.find({ userId }).lean();
  }
}