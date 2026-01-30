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
    const user = await this.userRepo.findUserByUid(loggedInUid);
    if (!user) throw new NotFoundError("User not found");

    if (
      !user.languageSubscriptionList ||
      !user.languageSubscriptionList.includes(language)
    ) {
      throw new NotFoundError("Language not subscribed");
    }

    // const templates = await this.templateRepo.findAll();
    // for (const template of templates) {
    //   // Start with template HTML
    //   let html = template.html_content ?? "";

    //   if (template.placeholders) {
    //     const placeholdersMap = template.placeholders; // Mongoose Map

    //     for (const [key, placeholder] of Object.entries(placeholdersMap)) {
    //       let value = "";

    //       const userField = (user as any)[key];

    //       if (userField != null) {
    //         // If the field is a Map/LocalizedField (multi-language), pick the correct language
    //         if (userField instanceof Map) {
    //           console.log("userField is a Map:", userField);
    //           value = userField.get(language) ?? ""; // Map type
    //         } else if (
    //           typeof userField === "object" &&
    //           !Array.isArray(userField)
    //         ) {
    //           console.log("userField is a plain object:", userField);
    //           value = userField[language] ?? ""; // plain object
    //         } else {
    //           const baseUrl =
    //             "https://profio-dbcm-s3-dev.sgp1.digitaloceanspaces.com/" +
    //             user._id.toString() +
    //             "/PROFILE";
    //           // if field is profileImageURL need to add base URL
    //           if (key === "profileImageURL" && typeof userField === "string") {
    //             value = `${baseUrl}/${userField}`;
    //           } else {
    //             value = userField; // Simple string field
    //           }
    //         }
    //       }

    //       console.log(
    //         `Replacing placeholder ${placeholder} with value: ${value}`
    //       );
    //       html = html.split(placeholder).join(value);
    //     }
    //   }

    //   console.log("Filled HTML:", html);
    //   template.html_content = html;
    // }

    const templates = await this.templateRepo.findAll();

    for (const template of templates) {
      let html = template.html_content ?? "";

      if (template.placeholders) {
        const placeholdersMap = template.placeholders;

        for (const [key, placeholder] of Object.entries(placeholdersMap)) {
          let value = "";

          const userField = (user as any)[key];

          if (userField != null) {
            if (userField instanceof Map) {
              value = userField.get(language) ?? "";
            } else if (
              typeof userField === "object" &&
              !Array.isArray(userField)
            ) {
              value = userField[language] ?? "";
            } else {
              const baseUrl =
                 "https://profio-dbcm-s3-dev.sgp1.digitaloceanspaces.com/" +
                user._id.toString() +
                "/PROFILE";

              if (key === "profileImageURL" && typeof userField === "string") {
                if (!userField || userField.trim() === "") {
                  value =
                      "https://profio-dbcm-s3-dev.sgp1.digitaloceanspaces.com/Common/default-profile.jpg";
                } else {
                  value = `${baseUrl}/${userField}`;
                }
              } else {
                value = userField;
              }
            }
          }

          // ===================================================
          // 🚀 Remove ONLY the wrapper <div class="link-bx-wrp">...</div>
          //     that contains this specific placeholder
          // ===================================================

          if (!value || value === "") {
            const wrapperRegex = new RegExp(
              `<div[^>]*class=['"]link-bx-wrp['"][^>]*>([\\s\\S]*?)<\/div>`,
              "g"
            );

            let match;
            while ((match = wrapperRegex.exec(html)) !== null) {
              if (match[1].includes(placeholder)) {
                html = html.replace(match[0], "");
                break; // remove only THIS block
              }
            }

            continue;
          }

          // Normal placeholder replacement
          html = html.split(placeholder).join(value);
        }
      }

      template.html_content = html;
    }

    return templates;
  }

  public async getTemplateById(id: string) {
    return this.templateRepo.findById(id);
  }
}
