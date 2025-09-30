import TemplateRepository from "../repositories/TemplateRepository";

export default class TemplateService {
  private templateRepo: TemplateRepository;

  constructor() {
    this.templateRepo = new TemplateRepository();
  }

  public async getAllTemplates() {
    return this.templateRepo.findAll();
  }

  public async getTemplateById(id: string) {
    return this.templateRepo.findById(id);
  }

}