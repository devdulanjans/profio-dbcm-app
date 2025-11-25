import { NotFoundError } from "../errors/NotFoundError";
import TemplateRepository from "../repositories/TemplateRepository";
import UserRepository from "../repositories/UserRepository";

export default class TemplateService {
  private templateRepo: TemplateRepository;
  private userRepo = new UserRepository();

  constructor() {
    this.templateRepo = new TemplateRepository();
  }

  public async getAllTemplates() {
    return this.templateRepo.findAll();
  }

  public async getAllTemplatesWithDetails(
    loggedInUid: string,
    language: string
  ) {
    const user = await this.userRepo.findById(loggedInUid);
    if (!user) throw new NotFoundError("User not found");

    const templates = await this.templateRepo.findAll();
    for (const template of templates) {
      // Start with template HTML
      let html = template.html_content ?? "";

      if (template.placeholders) {
        const placeholdersMap = template.placeholders; // Mongoose Map

        for (const [key, placeholder] of Object.entries(placeholdersMap)) {
          let value = "";

          const userField = (user as any)[key];

          if (userField != null) {
            // If the field is a Map/LocalizedField (multi-language), pick the correct language
            if (userField instanceof Map) {
              console.log("userField is a Map:", userField);
              value = userField.get(language) ?? ""; // Map type
            } else if (
              typeof userField === "object" &&
              !Array.isArray(userField)
            ) {
              console.log("userField is a plain object:", userField);
              value = userField[language] ?? ""; // plain object
            } else {
              const baseUrl =
                "https://profio-dbcm-s3-dev.sgp1.digitaloceanspaces.com/" +
                user._id.toString() +
                "/PROFILE";
              // if field is profileImageURL need to add base URL
              if (key === "profileImageURL" && typeof userField === "string") {
                value = `${baseUrl}/${userField}`;
              } else {
                value = userField; // Simple string field
              }
            }
          }

          console.log(
            `Replacing placeholder ${placeholder} with value: ${value}`
          );
          html = html.split(placeholder).join(value);
        }
      }

      console.log("Filled HTML:", html);
      template.html_content = html;
    }
    return;
  }

  public async getTemplateById(id: string) {
    return this.templateRepo.findById(id);
  }
}
