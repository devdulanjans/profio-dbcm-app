import { randomUUID } from "crypto";
import { UserTemplateModel } from "../models/UserTemplate";

export default class UserTemplateRepository {

  public async findByUserId(userId: string) {
    return UserTemplateModel.find({ user_id: userId });
  }

  public async findByPublicId(publicId: string) {
    return UserTemplateModel.findOne({ public_id: publicId });
  }

  public async findByUserIdAndTemplateId(userId: string, templateId: string) {
    return UserTemplateModel.findOne({ user_id: userId, template_id: templateId });
  }

  public async countTemplatesByUserId(userId: string): Promise<number> {
    return UserTemplateModel.countDocuments({ user_id: userId });
  }

  public async assignTemplateToUser(userId: string, templateId: string) {
    const userTemplate = new UserTemplateModel({ user_id: userId, template_id: templateId});
    return userTemplate.save();
  }

  public async deleteTemplateFromUser(userId: string, templateId: string) {
    return UserTemplateModel.findOneAndDelete({ user_id: userId, template_id: templateId });
  }
}
