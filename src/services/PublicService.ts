import UserRepository from "../repositories/UserRepository";
import TemplateRepository from "../repositories/TemplateRepository";
import UserTemplateRepository from "../repositories/UserTemplateRepository";
import { NotFoundError } from "../errors/NotFoundError";
import { UserTemplateModel } from "../models/UserTemplate";

export class PublicService {
  // private sharedLinkRepo = new SharedLinkRepository();
  private templateRepo = new TemplateRepository();
  private userTemplateRepo = new UserTemplateRepository();
  private userRepo = new UserRepository();

  async viewSharedTemplate(shareUrlName: string, templateCode: string, language: string = "en"): Promise<string> {

    const template = await this.templateRepo.findByTemplateCode(templateCode);
    if (!template) throw new NotFoundError("Template not found");

    const user = await this.userRepo.findByShareUrlName(shareUrlName);
    if (!user) throw new NotFoundError("User not found");

    const userTemplate = await this.userTemplateRepo.findByUserIdAndTemplateId(user._id.toString(), template._id.toString());
    if (!userTemplate) throw new NotFoundError("Template not assigned to user");

    userTemplate.view_count = (userTemplate.view_count ?? 0) + 1;
    await UserTemplateModel.findByIdAndUpdate(userTemplate._id, userTemplate, { new: true });

    // Start with template HTML
    let html = template.html_content ?? "";

    if (template.placeholders) {
      const placeholdersMap = template.placeholders; // Mongoose Map

      for (const [key, placeholder] of placeholdersMap.entries()) {
        let value = "";

        const userField = (user as any)[key];

        if (userField != null) {
          // If the field is a Map/LocalizedField (multi-language), pick the correct language
          if (userField instanceof Map) {
            console.log("userField is a Map:", userField);
            value = userField.get(language) ?? ""; // Map type
          } else if (typeof userField === "object" && !Array.isArray(userField)) {
            console.log("userField is a plain object:", userField);
            value = userField[language] ?? ""; // plain object
          } else {
            const baseUrl = "https://profio-dbcm-s3-dev.sgp1.digitaloceanspaces.com/"+user._id.toString()+"/PROFILE";
            // if field is profileImageURL need to add base URL
            if (key === "profileImageURL" && typeof userField === "string") {
              value = `${process.env.BASE_URL}/${userField}`;
            }
            // Simple string field
            value = userField;
          }
        }

        console.log(`Replacing placeholder ${placeholder} with value: ${value}`);
        html = html.split(placeholder).join(value);
      }
    }

    console.log("Filled HTML:", html);
    return html;
  }
}
