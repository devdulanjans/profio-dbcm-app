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

  async viewSharedTemplate(
    shareUrlName: string,
    templateCode: string,
    language: string = "en"
  ): Promise<string> {
    const template = await this.templateRepo.findByTemplateCode(templateCode);
    if (!template) throw new NotFoundError("Template not found");

    const user = await this.userRepo.findByShareUrlName(shareUrlName);
    if (!user) throw new NotFoundError("User not found");

    const userTemplate = await this.userTemplateRepo.findByUserIdAndTemplateId(
      user._id.toString(),
      template._id.toString()
    );
    if (!userTemplate) throw new NotFoundError("Template not assigned to user");

    userTemplate.view_count = (userTemplate.view_count ?? 0) + 1;
    await UserTemplateModel.findByIdAndUpdate(userTemplate._id, userTemplate, {
      new: true,
    });

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
          } else if (
            typeof userField === "object" &&
            !Array.isArray(userField)
          ) {
            console.log("userField is a plain object:", userField);
            value = userField[language] ?? ""; // plain object
          } else {
            const baseUrl =
              "https://profio.app/" +
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
    return html;
  }

  async viewSharedTemplateNew(
    shareUrlName: string,
    templateCode: string,
    language: string = "en"
  ): Promise<string> {
    const template = await this.templateRepo.findByTemplateCode(templateCode);
    if (!template) throw new NotFoundError("Template not found");

    const user = await this.userRepo.findByShareUrlName(shareUrlName);
    if (!user) throw new NotFoundError("User not found");

    const userTemplate = await this.userTemplateRepo.findByUserIdAndTemplateId(
      user._id.toString(),
      template._id.toString()
    );
    if (!userTemplate) throw new NotFoundError("Template not assigned to user");

    userTemplate.view_count = (userTemplate.view_count ?? 0) + 1;
    await UserTemplateModel.findByIdAndUpdate(userTemplate._id, userTemplate, {
      new: true,
    });

    // Start with template HTML
    let html = template.public_html_content ?? "";

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
          } else if (
            typeof userField === "object" &&
            !Array.isArray(userField)
          ) {
            console.log("userField is a plain object:", userField);
            value = userField[language] ?? ""; // plain object
          } else {
            const baseUrl =
              "https://profio.app/" +
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

    // replace {{language_data}} placeholder if exists
    let languageDataList = []
    if (html.includes("{{language_data}}")) {
      if (user.languageSubscriptionList) {
        for (const subscription of user.languageSubscriptionList) {
          if (!subscription) continue;
          if (subscription.trim() === "") continue;
          if (subscription === "en" || subscription === "ja") {
          console.log("Processing subscription language:", subscription);
          console.log("User languageSubscriptionList:", user.name);
            const languageData = {
            language: subscription === "en" ? "English" : subscription === "ja" ? "日本語" : subscription,
            name: user.name instanceof Map ? user.name.get(subscription) : user.name?.[subscription] || "",
            position: user.jobTitle instanceof Map ? user.jobTitle.get(subscription) : user.jobTitle?.[subscription] || "",
            contact: {
              email: user.email,
              phone: user.phoneNumber,
              whatsapp: user.whatsappNumber,
              officeName: user.companyPhoneNumber,
              office: user.companyAddress instanceof Map
              ? user.companyAddress.get(subscription)
              : user.companyAddress?.[subscription],
            },
            labels: subscription === "en"
              ? {
                email: "Email",
                phone: "Phone",
                whatsapp: "WhatsApp",
                office: "Office",
                share: "Share",
                save: "Save",
              }
              : {
                email: "メール",
                phone: "電話",
                whatsapp: "WhatsApp",
                office: "オフィス",
                share: "共有",
                save: "保存",
              },
            };
          languageDataList.push(languageData);
          }
        }
      }
      
      const languageDataJson = JSON.stringify(languageDataList);
      html = html.split("{{language_data}}").join(languageDataJson);
    }
    // console.log("Filled HTML:", html);
    return html;
  }

  async deactivateUserByEmail(email: string): Promise<void> {
    const user = await this.userRepo.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.isDeleted = true;
    user.updatedAt = new Date();
    await this.userRepo.update(user._id.toString(), user);
  }
}
