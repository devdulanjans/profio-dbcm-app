// src/services/UserService.ts
import UserRepository from "../repositories/UserRepository";
import { IUser } from "../models/User"; // Adjust the path as needed
import { UserCreateDto } from "../dtos/UserUpdateDto";
import { UserDto } from "../dtos/UserDto";
import { Response } from "express";
import { NotFoundError } from "../errors/NotFoundError";
import { AuthorizationError } from "../errors/AuthorizationError";
import AppGlobalConfig from "../models/AppGlobalConfig";
import AppGlobalConfigRepository from "../repositories/AppGlobalConfigRepository";
import { BadRequestError } from "../errors/BadRequestError";
import SubscriptionPlanRepository from "../repositories/SubscriptionPlanRepository";
import { uploadMedia } from "../utils/DocumentUpload";
// Add this import if ILocalizedField is defined elsewhere, e.g. in models/User
import { ILocalizedField } from "../models/User";

export default class UserService {
  private userRepo: UserRepository;
  private appGlobalConfigRepo: AppGlobalConfigRepository;
  private subscriptionPlanRepo: SubscriptionPlanRepository;

  constructor() {
    this.userRepo = new UserRepository();
    this.appGlobalConfigRepo = new AppGlobalConfigRepository();
    this.subscriptionPlanRepo = new SubscriptionPlanRepository();
  }

  public async getAllUsers() {
    return this.userRepo.findAll();
  }

  public async getUserById(id: string) {
    return this.userRepo.findById(id);
  }

  public async getUserByAuth0Id(auth0Id: string) {
    return UserRepository.findUserByAuth0Id(auth0Id);
  }

  public async getUserByShareUrlName(shareUrlName: string) {
    return this.userRepo.findByShareUrlName(shareUrlName);
  }

  public async createUser(data: UserDto): Promise<IUser> {
    return UserRepository.create(data);
  }

  private async buildLocalized(value: string | undefined, inputLang: string, subscribedLangs: string[]): Promise<Record<string, string> | undefined> {
    if (!value) return undefined;

    const translations: Record<string, string> = { [inputLang]: value };

    for (const lang of subscribedLangs) {
      if (lang !== inputLang) {
        translations[lang] = await this.translateText(value, lang);
      }
    }

    return translations;
  }

  private buildLocalizedWithout(translations: Record<string, string> | Map<string, string> | undefined, inputLang: string): Record<string, string> | undefined {
    if (!translations) return undefined;

    // Handle Map type (e.g., Mongoose Map)
    if (translations instanceof Map) {
      const result: Record<string, string> = {};
      for (const [key, value] of translations.entries()) {
        if (key !== inputLang) {
          result[key] = value;
        }
      }
      // console.log(`Removed language ${inputLang} from Map, remaining translations:`, result);
      return result;
    }

    // Handle plain object
    const { [inputLang]: _, ...rest } = translations as Record<string, string>;
    // console.log(`Removed language ${inputLang} from object, remaining translations:`, rest);
    return rest;
  }


  public async updateUser(id: string, data: Partial<UserCreateDto>) {
    const inputLang = data.language || "en";

    // Fetch existing user to get subscribed languages
    const existingUser = await this.userRepo.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const subscribedLangs = existingUser.languageSubscriptionList || ["en"];

    if (!subscribedLangs.includes(inputLang)) {
      throw new BadRequestError(`Language ${inputLang} not subscribed`);
    }

    const newDocuments = data.newDocuments;
    if (existingUser.subscriptionId) {

      if (newDocuments && newDocuments.length > 0) {
        const subscriptionPlan = await this.subscriptionPlanRepo.findById(existingUser.subscriptionId);

        if (subscriptionPlan && subscriptionPlan.document_upload_limit !== undefined) {

          const docLimit = subscriptionPlan.document_upload_limit;
          const existingDocCount = data.existingDocuments ? data.existingDocuments.length : 0;

          if (existingDocCount + newDocuments.length > docLimit) {
            throw new BadRequestError(`Document upload limit exceeded. Limit: ${docLimit}, Current: ${existingDocCount}`);
          }

        }
      }
    } else {
      if (newDocuments && newDocuments.length > 0) {
        throw new BadRequestError("No subscription plan associated with user for document uploads");
      }
    }
    
    let profileImageUrl = existingUser.profileImageURL;
    // Handle media upload if there's a new profile image
    if (data.profileImage) {

      const fileName = data.profileImage.filename || "";
      const fileExtension = fileName.split('.').pop() || "";

      if (fileExtension && fileName) {
        const uploadResult = await uploadMedia(id, fileExtension, data.profileImage.buffer);
        profileImageUrl = uploadResult.data?.DocumentURL; 
      }

    }

    let uploadedDocuments: { title: ILocalizedField; url: string }[] = [];
    for (const doc of data.newDocuments || []) {
      if (doc.file) {
        const fileName = doc.file.filename || "";
        const fileExtension = fileName.split('.').pop() || "";

        if (fileExtension && fileName) {
          const uploadResult = await uploadMedia(id, fileExtension, doc.file.buffer);
          if (uploadResult.status === 0 && uploadResult.data?.DocumentURL) {
            // Convert title to ILocalizedField (assuming inputLang and subscribedLangs are available)
            const localizedTitle = await this.buildLocalized(doc.title, inputLang, subscribedLangs) ?? {};
            uploadedDocuments.push({ title: localizedTitle, url: uploadResult.data.DocumentURL });
          }
        }
      }
    }

    let mergedDocuments: { title: ILocalizedField; url: string }[] = (data.existingDocuments
      ? data.existingDocuments.map(doc => ({
          title: typeof doc.title === "string" ? { en: doc.title } : doc.title,
          url: doc.url,
        }))
      : []);
    if (uploadedDocuments.length > 0) {
      mergedDocuments = mergedDocuments.concat(uploadedDocuments);
    }

    let sharedURLName = data.name?.trim().replace(/\s+/g, "_").toLowerCase() || "" ;

    // check any existing user already have this shareURLName
    const userWithSameShareURL = await this.userRepo.findByShareUrlName(sharedURLName);

    if (userWithSameShareURL) {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const ddmmyyyyhhmmss = pad(now.getDate()) + pad(now.getMonth() + 1) + now.getFullYear() + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
      sharedURLName = `${sharedURLName}_${ddmmyyyyhhmmss}`; // append timestamp in ddmmyyyyhhmmss format to make it unique
    }
    

    const user = {
      name: await this.buildLocalized(data.name, inputLang, subscribedLangs),
      phoneNumber: data.phoneNumber,
      personalAddress: await this.buildLocalized(data.personalAddress, inputLang, subscribedLangs),
      personalWebsite: data.personalWebsite,
      companyName: await this.buildLocalized(data.companyName, inputLang, subscribedLangs),
      jobTitle: await this.buildLocalized(data.jobTitle, inputLang, subscribedLangs),
      companyEmail: data.companyEmail,
      companyPhoneNumber: data.companyPhoneNumber,
      companyAddress: await this.buildLocalized(data.companyAddress, inputLang, subscribedLangs),
      companyWebsite: data.companyWebsite,
      whatsappNumber: data.whatsappNumber,
      facebookUrl: data.facebookUrl,
      instagramUrl: data.instagramUrl,
      linkedInUrl: data.linkedInUrl,
      tikTokUrl: data.tikTokUrl,
      youtubeUrl: data.youtubeUrl,
      profileImageUrl: profileImageUrl,

      otherLinks: data.otherLinks
        ? await Promise.all(
            data.otherLinks.map(async (link: any) => ({
              title: (await this.buildLocalized(link.title, inputLang, subscribedLangs)) ?? {},
              url: String(link.url),
            }))
          )
        : undefined,

      documents: mergedDocuments,

      updatedAt: new Date(),
    };

    return this.userRepo.update(id, user);
  }

  public async deleteUser(id: string) {
    return this.userRepo.delete(id);
  }

  private async translateText(text: string, targetLang: string): Promise<string> {
    // Call Google Translate, DeepL, or your own service
    // Example: return await googleTranslate(text, targetLang);
    return `${text}_${targetLang}`; // mock translation
  }

  public async subscribeLanguage(userId: string, language: string, auth0Id: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.auth0Id || user.auth0Id !== auth0Id) {
      throw new AuthorizationError("Unauthorized: Auth0 ID does not match");
    }

    const appConfig = await this.appGlobalConfigRepo.findAll();
    const supportedLanguages = appConfig.length > 0 ? appConfig[0].languages || ["en"] : ["en"];

    console.log("Supported languages from AppGlobalConfig:", supportedLanguages);
    console.log("Requested language to subscribe:", language);

    if (!supportedLanguages.includes(language)) {
      console.log("Language not supported");
      throw new NotFoundError("Language not supported");
    }
    console.log("Language is supported:", user.languageSubscriptionList);
    user.languageSubscriptionList = user.languageSubscriptionList || [];

    const subscriptionPlanId = user.subscriptionId;
    if (!subscriptionPlanId) {
      throw new BadRequestError("No subscription plan associated with user");
    }

    const subscriptionPlan = await this.subscriptionPlanRepo.findById(subscriptionPlanId);
    if (!subscriptionPlan) {
      throw new NotFoundError("Subscription plan not found");
    }

    const maxLanguages = subscriptionPlan.language_limit || 0;

    console.log(`User's current subscribed languages: ${user.languageSubscriptionList}`);
    console.log(`User's subscription plan allows max ${maxLanguages} languages`);

    if (user.languageSubscriptionList.length >= maxLanguages) {
      throw new BadRequestError("Language subscription limit reached");
    }

    if (!user.languageSubscriptionList.includes(language)) {
      user.languageSubscriptionList.push(language);
    } else {
      throw new BadRequestError("Language already subscribed");
    }

    console.log("Updated subscribed languages:", user.languageSubscriptionList);

    const subscribedLangs = user.languageSubscriptionList;

    // Determine the inputLang for localization: prefer 'en', else first subscribed language
    const preferredLang = subscribedLangs.includes("en") ? "en" : subscribedLangs[0];
    console.log("Preferred language for localization:", preferredLang);

    user.updatedAt = new Date();
    user.name = await this.buildLocalized(typeof user.name === "string" ? user.name : user.name instanceof Map ? user.name.get(preferredLang) || "" : user.name?.[preferredLang] || "", preferredLang, subscribedLangs );
    user.personalAddress = await this.buildLocalized(typeof user.personalAddress === "string" ? user.personalAddress : user.personalAddress instanceof Map ? user.personalAddress.get(preferredLang) || "" : user.personalAddress?.[preferredLang] || "", preferredLang, subscribedLangs);
    user.companyName = await this.buildLocalized(typeof user.companyName === "string" ? user.companyName : user.companyName instanceof Map ? user.companyName.get(preferredLang) || "" : user.companyName?.[preferredLang] || "", preferredLang, subscribedLangs);
    user.jobTitle = await this.buildLocalized(typeof user.jobTitle === "string" ? user.jobTitle : user.jobTitle instanceof Map ? user.jobTitle.get(preferredLang) || "" : user.jobTitle?.[preferredLang] || "", preferredLang, subscribedLangs);
    user.companyAddress = await this.buildLocalized(typeof user.companyAddress === "string" ? user.companyAddress : user.companyAddress instanceof Map ? user.companyAddress.get(preferredLang) || "" : user.companyAddress?.[preferredLang] || "", preferredLang, subscribedLangs);

    if (user.otherLinks) {
      user.otherLinks = await Promise.all(
        user.otherLinks.map(async (link: any) => ({
          title: (await this.buildLocalized(typeof link.title === "string" ? link.title : link.title instanceof Map ? link.title.get(preferredLang) || "" : link.title?.[preferredLang] || "", preferredLang, subscribedLangs)) ?? {},
          url: String(link.url),
        }))
      );
    }

    if (user.documents) {
      user.documents = await Promise.all(
        user.documents.map(async (doc: any) => ({
          title: (await this.buildLocalized(typeof doc.title === "string" ? doc.title : doc.title instanceof Map ? doc.title.get(preferredLang) || "" : doc.title?.[preferredLang] || "", preferredLang, subscribedLangs)) ?? {},
          url: String(doc.url),
        }))
      );
    }
    
    // Finally, update the user record
    console.log("Final user object to be saved:", user);
    await this.userRepo.update(userId, user);
    return user;
  }

  public async unsubscribeLanguage(userId: string, language: string, auth0Id: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.auth0Id || user.auth0Id !== auth0Id) {
      throw new AuthorizationError("Unauthorized: Auth0 ID does not match");
    }

    user.languageSubscriptionList = user.languageSubscriptionList || [];

    if (!user.languageSubscriptionList?.includes(language)) {
      throw new BadRequestError("Language not subscribed");
    }

    user.languageSubscriptionList = user.languageSubscriptionList.filter(lang => lang !== language);

    const subscribedLangs = user.languageSubscriptionList;

    if (subscribedLangs.length === 0) {
      console.log("No languages left after unsubscription, clearing localized fields");

      user.name = {};
      user.personalAddress = {};
      user.companyName = {};
      user.jobTitle = {};
      user.companyAddress = {};
      if (user.otherLinks) {
        user.otherLinks = user.otherLinks.map((link: any) => ({ ...link, title: {} }));
      }
      if (user.documents) {
        user.documents = user.documents.map((doc: any) => ({ ...doc, title: {} }));
      }
    } else {
      console.log("Languages still subscribed:", subscribedLangs);

      user.name = this.buildLocalizedWithout(user.name, language);
      user.personalAddress = this.buildLocalizedWithout(user.personalAddress, language);
      user.companyName = this.buildLocalizedWithout(user.companyName, language);
      user.jobTitle = this.buildLocalizedWithout(user.jobTitle, language);
      user.companyAddress = this.buildLocalizedWithout(user.companyAddress, language);

      if (user.otherLinks) {
        user.otherLinks = await Promise.all(
          user.otherLinks.map(async (link: any) => ({
            title: (this.buildLocalizedWithout(link.title, language)) ?? {},
            url: String(link.url),
          }))
        );
      }

      if (user.documents) {
        user.documents = await Promise.all(
          user.documents.map(async (doc: any) => ({
            title: (this.buildLocalizedWithout(doc.title, language)) ?? {},
            url: String(doc.url),
          }))
        );
      }
    }

    user.updatedAt = new Date();
    console.log("Final user object to be saved after unsubscription:", user);

    await this.userRepo.update(userId, user);
    return user;
  }
}
