import SupscriptionPlanRepo from "../repositories/SubscriptionPlanRepository";
import UserRepository from "../repositories/UserRepository";
import PaymentRepository from "../repositories/PaymentRepository";
import { PaymentCreateDto } from "../dtos/PaymentCreateDto";
// import Stripe from "stripe";

export default class SubscriptionPlanService {
  private subscriptionRepo: SupscriptionPlanRepo;
  private userRepository: UserRepository;
  private paymentRepository: PaymentRepository;
  // private stripe: Stripe;

  constructor() {
    this.subscriptionRepo = new SupscriptionPlanRepo();
    this.userRepository = new UserRepository();
    this.paymentRepository = new PaymentRepository();
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: "2025-09-30.clover",
    // });
  }

  public async getAllSubscriptions() {
    return this.subscriptionRepo.findAll();
  }

  public async getSubscriptionById(id: string) {
    return this.subscriptionRepo.findById(id);
  }

  public async getSubscriptionByCode(code: string) {
    return this.subscriptionRepo.findByCode(code);
  }

  public async assignSubscriptionToUser(
    uid: string,
    userId: string,
    subscriptionId: string,
    paymentSubscriptionType: string,
    amount: number,
    currencyCode: string,
    paymentId: string
  ) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    if (user.uid !== uid) {
      throw new Error("UID does not match the user record");
    }

    if (
      paymentSubscriptionType !== "MONTHLY" &&
      paymentSubscriptionType !== "YEARLY"
    ) {
      throw new Error("Invalid payment subscription type");
    }

    const subscription = await this.subscriptionRepo.findById(subscriptionId);

    if (!subscription) {
      throw new Error("Subscription plan not found");
    }

    // const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentId);

    // if (paymentIntent.status !== "succeeded") {
    //   throw new Error(`Payment not successful. Current status: ${paymentIntent.status}`);
    // }

    // if (paymentIntent.amount !== amount || paymentIntent.currency !== currencyCode.toLowerCase()) {
    //   throw new Error("Payment details mismatch with Stripe");
    // }

    const paymentDate = new Date();
    let nextPaymentDate = new Date(paymentDate);

    if (paymentSubscriptionType === "MONTHLY") {
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    } else if (paymentSubscriptionType === "YEARLY") {
      nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    }

    user.subscriptionId = subscription._id;
    user.paymentSubscriptionType = paymentSubscriptionType;
    user.updatedAt = new Date();
    user.nextPaymentDate = nextPaymentDate;
    user.lastPaymentDate = paymentDate;
    const updatedUser = await this.userRepository.update(userId, user);

    if (!updatedUser) {
      throw new Error("Failed to update user with subscription");
    }

    const paymentRecord: PaymentCreateDto = {
      userId,
      amount,
      currencyCode,
      paymentId,
      status: "COMPLETED",
      paymentDate,
      createdAt: new Date(),
    };
    const createdPayment = await this.paymentRepository.create(paymentRecord);

    if (!createdPayment) {
      throw new Error("Failed to create payment record");
    }

    return updatedUser;
  }
}
