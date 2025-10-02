import UserTemplateRepository from "../repositories/UserTemplateRepository";
import TemplateRepository from "../repositories/TemplateRepository";
import UserRepository from "../repositories/UserRepository";
import SubscriptionRepository from "../repositories/SubscriptionPlanRepository";
import { v4 as uuidv4 } from "uuid";
import SharedLinkRepository from "../repositories/SharedLinkRepository";
import { NotFoundError } from "../errors/NotFoundError";
import { AuthorizationError } from "../errors/AuthorizationError";
import { UserTemplateModel } from "../models/UserTemplate";

export default class UserTemplateService {
  private userTemplateRepo: UserTemplateRepository;
  private userRepo: UserRepository;
  private subscriptionRepo: SubscriptionRepository;
  private templateRepo: TemplateRepository;
  private sharedLinkRepo: SharedLinkRepository;

  constructor() {
    this.userTemplateRepo = new UserTemplateRepository();
    this.userRepo = new UserRepository();
    this.subscriptionRepo = new SubscriptionRepository();
    this.templateRepo = new TemplateRepository();
    this.sharedLinkRepo = new SharedLinkRepository();
  }

  public async getTemplateDetailsByUserId(userId: string) {
    // Get template IDs assigned to the user
    const userTemplates = await this.userTemplateRepo.findByUserId(userId);

    // Get user details
    const userDetails = await this.userRepo.findById(userId);

    // Get template details for each template ID
    const templateDetails = await Promise.all(
      userTemplates.map(async (ut: any) => {
        return await this.templateRepo.findById(ut.template_id);
      })
    );

    return {
      user: userDetails,
      templates: templateDetails,
    };
  }

  public async getDetailsByUserIdAndTemplateId(userId: string, templateId: string) {
    // Get user details
    const userDetails = await this.userRepo.findById(userId);

    // Get template details
    const templateDetails = await this.templateRepo.findById(templateId);

    return {
      user: userDetails,
      template: templateDetails,
    };
  }

  public async assignTemplateToUser(userId: string, templateId: string) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      console.error(`User not found with ID: ${userId}`);
      throw new Error("User not found.");
    }

    const subscriptionId = await this.userRepo.getSubscriptionIdByUserId(userId);

    if (!subscriptionId) {
      console.error(`No subscription found for user ID: ${userId}`);
      throw new Error("User subscription not found.");
    }

    const subscription = await this.subscriptionRepo.findById(subscriptionId);

    if (!subscription) {
      console.error(`No subscription details found for subscription ID: ${subscriptionId}`);
      throw new Error("Subscription plan not found.");
    }

    const templateLimit = subscription.card_template_limit;
    console.log(`User ID: ${userId} has subscription ID: ${subscriptionId} with template limit: ${templateLimit}`);

    if (templateLimit === undefined) {
      console.error(`Template limit is undefined for subscription ID: ${subscriptionId}`);
      throw new Error("Template limit is not defined for this subscription.");
    }

    const existingTemplateCount = await this.userTemplateRepo.countTemplatesByUserId(userId);
    console.log(`User ID: ${userId} currently has ${existingTemplateCount} templates assigned.`);
    
    if (existingTemplateCount >= templateLimit) {
      console.error(`User ID: ${userId} has reached the template limit of ${templateLimit}`);
      throw new Error("Template limit reached for this subscription.");
    }

    return this.userTemplateRepo.assignTemplateToUser(userId, templateId);
  }

  public async deleteTemplateFromUser(userId: string, templateId: string) {
    return this.userTemplateRepo.deleteTemplateFromUser(userId, templateId);
  }

  // create shareable link
  public async shareTemplate(ownerUid: string, templateId: string, userId: string, language: string = "en"): Promise<string> {
    const user = await UserRepository.findUserByUid(ownerUid);

    if (!user) throw new NotFoundError("User not found");

    const loggedUserId = user.id;
    if (userId !== loggedUserId) throw new AuthorizationError("Unauthorized action");

    const userTemplate = await this.userTemplateRepo.findByUserIdAndTemplateId(userId, templateId);

    if (!userTemplate) throw new Error("Template does not belong to you");

    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new NotFoundError("Template not found");

    console.log(`frontend url: ${process.env.FRONTEND_URL}`);

    const link = `${process.env.FRONTEND_URL}/${language}/${user.shareURLName}/${template.template_code}`;

    return link;
  }

  public async incrementViewCount(userId: string, templateId: string) {
    const userTemplate = await this.userTemplateRepo.findByUserIdAndTemplateId(userId, templateId);
    if (!userTemplate) throw new NotFoundError("UserTemplate not found");

    userTemplate.view_count = (userTemplate.view_count ?? 0) + 1;
    await UserTemplateModel.findByIdAndUpdate(userTemplate._id, userTemplate, { new: true });

    return { status: 0, message: "View count updated successfully", view_count: userTemplate.view_count };
  }

}