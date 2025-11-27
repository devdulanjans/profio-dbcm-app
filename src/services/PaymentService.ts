import PaymentRepository from "../repositories/PaymentRepository";
import UserRepository from "../repositories/UserRepository";
import { PaymentCreateDto } from "../dtos/PaymentCreateDto";
// import Stripe from "stripe";

class PaymentService {
  private repo = new PaymentRepository();
  private userRepo = new UserRepository();
  // private stripe: Stripe;

  constructor() {
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: "2025-09-30.clover",
    // });
  }

  async createPaymentRecord(
    uid: string,
    userId: string,
    amount: number,
    currencyCode: string,
    paymentId: string,
    status: string,
    paymentDate: Date
  ) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.uid !== uid) {
      throw new Error("Unauthorized to create payment record for this user");
    }

    // const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    // if (paymentIntent.status !== "succeeded") {
    //   throw new Error(`Payment not successful. Current status: ${paymentIntent.status}`);
    // }

    // if (paymentIntent.amount !== amount || paymentIntent.currency !== currencyCode.toLowerCase()) {
    //   throw new Error("Payment details mismatch with Stripe");
    // }

    const paymentRecord: PaymentCreateDto = {
      userId,
      amount,
      currencyCode,
      paymentId,
      status,
      paymentDate,
      createdAt: new Date(),
    };
    const createdPayment = await this.repo.create(paymentRecord);

    let nextPaymentDate = null;

    if (user.paymentSubscriptionType === "MONTHLY") {
      nextPaymentDate = new Date(createdPayment.paymentDate);
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else if (user.paymentSubscriptionType === "YEARLY") {
      nextPaymentDate = new Date(createdPayment.paymentDate);
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }

    if (nextPaymentDate) {
      await this.userRepo.updatePaymentSubscriptionDetails(
        userId,
        createdPayment.paymentDate,
        nextPaymentDate
      );
    } else {
      return null;
    }

    return createdPayment;
  }

  async getPaymentRecords(uid: string, userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.uid !== uid) {
      throw new Error("Unauthorized to access payment records for this user");
    }

    return this.repo.findByUserId(userId);
  }
}

export default PaymentService;
