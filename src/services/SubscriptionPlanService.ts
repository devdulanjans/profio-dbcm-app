import SupscriptionPlanRepo from "../repositories/SubscriptionPlanRepository";

export default class SubscriptionPlanService {
  private subscriptionRepo: SupscriptionPlanRepo;

  constructor() {
    this.subscriptionRepo = new SupscriptionPlanRepo();
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

}