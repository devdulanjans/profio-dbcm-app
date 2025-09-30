import { TemplateModel } from "../models/Template";

export default class TemplateRepository {
  public async findAll() {
    return TemplateModel.find().lean();
  }

  public async findById(id: string) {
    return TemplateModel.findById(id);
  }

  public async findByTemplateCode(templateCode: string) {
    return TemplateModel.findOne({ template_code: templateCode });
  }
}
