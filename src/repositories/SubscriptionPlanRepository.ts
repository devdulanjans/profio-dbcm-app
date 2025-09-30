import { SubscriptionPlanModel } from "../models/SubscriptionPlan";

export default class SubscriptionPlanRepository {
  public async findAll() {
    return SubscriptionPlanModel.find().lean();
  }

  public async findById(id: string) {
    return SubscriptionPlanModel.findById(id);
  }

  public async findByCode(code: string) {
    return SubscriptionPlanModel.findOne({ code });
  }

  public static async findBySubscriptionCode(code: string) {
    return SubscriptionPlanModel.findOne({ code });
  }
}
