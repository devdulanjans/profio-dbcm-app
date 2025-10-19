// src/services/UserService.ts
import UserRepository from "../repositories/UserRepository";
import { IUser } from "../models/User"; // Adjust the path as needed
import { UserCreateDto } from "../dtos/UserUpdateDto";
import { UserDto } from "../dtos/UserDto";
import e, { Response } from "express";
import { NotFoundError } from "../errors/NotFoundError";
import { AuthorizationError } from "../errors/AuthorizationError";
import AppGlobalConfig from "../models/AppGlobalConfig";
import AppGlobalConfigRepository from "../repositories/AppGlobalConfigRepository";
import { BadRequestError } from "../errors/BadRequestError";
import SubscriptionPlanRepository from "../repositories/SubscriptionPlanRepository";
import { uploadMedia, deleteMedia, getPreSignedURL } from "../utils/DocumentUpload";
// Add this import if ILocalizedField is defined elsewhere, e.g. in models/User
import { ILocalizedField } from "../models/User";
import { get } from "http";
import { ObjectId } from "mongodb";

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

  public async getUserByUid(uid: string) {
    return UserRepository.findUserByUid(uid);
  }

  public async getUserByShareUrlName(shareUrlName: string) {
    return this.userRepo.findByShareUrlName(shareUrlName);
  }

  public async createUser(data: UserDto): Promise<IUser> {
    return UserRepository.create(data);
  }

  // private async buildLocalized(value: string | undefined, inputLang: string, subscribedLangs: string[]): Promise<Record<string, string> | undefined> {
  //   if (!value) return undefined;

  //   const translations: Record<string, string> = { [inputLang]: value };

  //   for (const lang of subscribedLangs) {
  //     if (lang !== inputLang) {
  //       translations[lang] = await this.translateText(value, lang);
  //     }
  //   }

  //   return translations;
  // }

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


  // public async updateUser(id: string, data: Partial<UserCreateDto>) {
  //   const inputLang = data.language || "en";

  //   const existingUser = await this.userRepo.findById(id);
  //   if (!existingUser) {
  //     throw new Error("User not found");
  //   }

  //   const subscribedLangs = existingUser.languageSubscriptionList || ["en"];

  //   if (!subscribedLangs.includes(inputLang)) {
  //     throw new BadRequestError(`Language ${inputLang} not subscribed`);
  //   }

  //   // build update object only with fields provided
  //   const user: Record<string, any> = {};
  //   user.updatedAt = new Date();

  //   if (!existingUser.shareURLName || existingUser.shareURLName.trim() === "") {
  //     let sharedURLName = data.name?.trim().replace(/\s+/g, "_").toLowerCase() || "" ;

  //     // check any existing user already have this shareURLName
  //     const userWithSameShareURL = await this.userRepo.findByShareUrlName(sharedURLName);

  //     if (userWithSameShareURL) {
  //       const now = new Date();
  //       const pad = (n: number) => n.toString().padStart(2, '0');
  //       const ddmmyyyyhhmmss = pad(now.getDate()) + pad(now.getMonth() + 1) + now.getFullYear() + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());
  //       sharedURLName = `${sharedURLName}_${ddmmyyyyhhmmss}`; // append timestamp in ddmmyyyyhhmmss format to make it unique
  //     }
  //     user.shareURLName = sharedURLName;
  //   }
    

  //   if (data.name) user.name = await this.buildLocalized(data.name, inputLang, subscribedLangs);
  //   if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
  //   if (data.personalAddress) user.personalAddress = await this.buildLocalized(data.personalAddress, inputLang, subscribedLangs);
  //   if (data.personalWebsite) user.personalWebsite = data.personalWebsite;
  //   if (data.companyName) user.companyName = await this.buildLocalized(data.companyName, inputLang, subscribedLangs);
  //   if (data.jobTitle) user.jobTitle = await this.buildLocalized(data.jobTitle, inputLang, subscribedLangs);
  //   if (data.companyEmail) user.companyEmail = data.companyEmail;
  //   if (data.companyPhoneNumber) user.companyPhoneNumber = data.companyPhoneNumber;
  //   if (data.companyAddress) user.companyAddress = await this.buildLocalized(data.companyAddress, inputLang, subscribedLangs);
  //   if (data.companyWebsite) user.companyWebsite = data.companyWebsite;
  //   if (data.whatsappNumber) user.whatsappNumber = data.whatsappNumber;
  //   if (data.facebookUrl) user.facebookUrl = data.facebookUrl;
  //   if (data.instagramUrl) user.instagramUrl = data.instagramUrl;
  //   if (data.linkedInUrl) user.linkedInUrl = data.linkedInUrl;
  //   if (data.tikTokUrl) user.tikTokUrl = data.tikTokUrl;
  //   if (data.youtubeUrl) user.youtubeUrl = data.youtubeUrl;

  //   if (data.otherLinks) {
  //     user.otherLinks = await Promise.all(
  //       data.otherLinks.map(async (link: any) => ({
  //         title: (await this.buildLocalized(link.title, inputLang, subscribedLangs)) ?? {},
  //         url: String(link.url),
  //       }))
  //     );
  //   }

  //   return this.userRepo.update(id, user);
  // }

  public async updateUser(id: string, data: Partial<UserCreateDto>) {
    const existingUser = await this.userRepo.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    const subscribedLangs = existingUser.languageSubscriptionList || ["en"];

    const user: Record<string, any> = {};
    user.updatedAt = new Date();

    // generate shareURLName if not already set
    if (!existingUser.shareURLName || existingUser.shareURLName.trim() === "") {
      let sharedURLName =
        data.name && typeof data.name === "object"
          ? (data.name["en"] || "").trim().replace(/\s+/g, "_").toLowerCase()
          : "";

      if (sharedURLName) {
        const userWithSameShareURL = await this.userRepo.findByShareUrlName(sharedURLName);

        if (userWithSameShareURL) {
          const now = new Date();
          const pad = (n: number) => n.toString().padStart(2, "0");
          const ddmmyyyyhhmmss =
            pad(now.getDate()) +
            pad(now.getMonth() + 1) +
            now.getFullYear() +
            pad(now.getHours()) +
            pad(now.getMinutes()) +
            pad(now.getSeconds());
          sharedURLName = `${sharedURLName}_${ddmmyyyyhhmmss}`;
        }

        user.shareURLName = sharedURLName;
      }
    }

    console.log("Subscribed languages for user:", subscribedLangs);

    const clean = (obj: any) => {
      if (!obj) return obj;

      // 🧩 Convert Mongoose Map → plain object
      if (obj instanceof Map) {
        return Object.fromEntries(obj.entries());
      }

      // 🧩 Convert subdocument → plain object
      if (typeof obj.toObject === "function") {
        obj = obj.toObject();
      }

      // 🧩 Remove Mongoose internals like "$__"
      if (typeof obj === "object" && !Array.isArray(obj)) {
        return Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith("$")));
      }

      return obj;
    };




    // helpers
    const validateLangObject = (field: any, fieldName: string) => {
      console.log(`Validating field ${fieldName}:`, field);
      if (typeof field !== "object" || Array.isArray(field)) {
        throw new BadRequestError(`${fieldName} must be an object with language keys`);
      }
      for (const lang of Object.keys(field)) {
        if (!subscribedLangs.includes(lang)) {
          throw new BadRequestError(`Language ${lang} not subscribed`);
        }
      }
      return field;
    };

    const mergeLocalized = ( existing: Record<string, string> = {}, incoming: Record<string, string>, fieldName: string) => {
        
        console.log(`Merging localized field ${fieldName}:`, { existing, incoming });
        existing = clean(existing);
        incoming = clean(incoming);

        const validated = validateLangObject(incoming, fieldName);

        console.log(`Merging localized field ${fieldName}:`, { existing, validated });

        return { ...existing, ...validated };
      };


    if (data.name) user.name = mergeLocalized(existingUser.name, data.name, "name");
    if (data.personalAddress) user.personalAddress = mergeLocalized(existingUser.personalAddress, data.personalAddress, "personalAddress");
    if (data.companyName) user.companyName = mergeLocalized(existingUser.companyName, data.companyName, "companyName");
    if (data.jobTitle) user.jobTitle = mergeLocalized(existingUser.jobTitle, data.jobTitle, "jobTitle");
    if (data.companyAddress) user.companyAddress = mergeLocalized(existingUser.companyAddress, data.companyAddress, "companyAddress");

    if (data.phoneNumber) user.phoneNumber = data.phoneNumber;
    if (data.personalWebsite) user.personalWebsite = data.personalWebsite;
    if (data.companyEmail) user.companyEmail = data.companyEmail;
    if (data.companyPhoneNumber) user.companyPhoneNumber = data.companyPhoneNumber;
    if (data.companyWebsite) user.companyWebsite = data.companyWebsite;
    if (data.whatsappNumber) user.whatsappNumber = data.whatsappNumber;
    if (data.facebookUrl) user.facebookUrl = data.facebookUrl;
    if (data.instagramUrl) user.instagramUrl = data.instagramUrl;
    if (data.linkedInUrl) user.linkedInUrl = data.linkedInUrl;
    if (data.tikTokUrl) user.tikTokUrl = data.tikTokUrl;
    if (data.youtubeUrl) user.youtubeUrl = data.youtubeUrl;

    if (data.otherLinks) {
      user.otherLinks = data.otherLinks.map((link: any, idx: number) => ({
        title: mergeLocalized(existingUser.otherLinks?.[idx]?.title, link.title, `otherLinks[${idx}].title`),
        url: String(link.url),
      }));
    }

    return this.userRepo.update(id, user);
  }

  public async updatePaymentSubscriptionPlan(userId: string, paymentSubscriptionType: string, uid: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: User ID does not match");
    }

    if (paymentSubscriptionType !== "MONTHLY" && paymentSubscriptionType !== "YEARLY") {
      throw new BadRequestError("Invalid payment subscription type");
    }

    if (user.paymentSubscriptionType === paymentSubscriptionType) {
      throw new BadRequestError(`User already has ${paymentSubscriptionType} subscription`);
    }

    user.paymentSubscriptionType = paymentSubscriptionType;
    user.updatedAt = new Date();
    await this.userRepo.update(userId, user);
    return user;
  }

  public async deleteUser(id: string) {
    return this.userRepo.delete(id);
  }

  // private async translateText(text: string, targetLang: string): Promise<string> {
  //   // Call Google Translate, DeepL, or your own service
  //   // Example: return await googleTranslate(text, targetLang);
  //   return `${text}_${targetLang}`; // mock translation
  // }

  public async subscribeLanguage(userId: string, language: string, uid: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: User ID does not match");
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

    // const subscribedLangs = user.languageSubscriptionList;

    // Determine the inputLang for localization: prefer 'en', else first subscribed language
    // const preferredLang = subscribedLangs.includes("en") ? "en" : subscribedLangs[0];
    // console.log("Preferred language for localization:", preferredLang);

    user.updatedAt = new Date();
    // user.name = await this.buildLocalized(typeof user.name === "string" ? user.name : user.name instanceof Map ? user.name.get(preferredLang) || "" : user.name?.[preferredLang] || "", preferredLang, subscribedLangs );
    // user.personalAddress = await this.buildLocalized(typeof user.personalAddress === "string" ? user.personalAddress : user.personalAddress instanceof Map ? user.personalAddress.get(preferredLang) || "" : user.personalAddress?.[preferredLang] || "", preferredLang, subscribedLangs);
    // user.companyName = await this.buildLocalized(typeof user.companyName === "string" ? user.companyName : user.companyName instanceof Map ? user.companyName.get(preferredLang) || "" : user.companyName?.[preferredLang] || "", preferredLang, subscribedLangs);
    // user.jobTitle = await this.buildLocalized(typeof user.jobTitle === "string" ? user.jobTitle : user.jobTitle instanceof Map ? user.jobTitle.get(preferredLang) || "" : user.jobTitle?.[preferredLang] || "", preferredLang, subscribedLangs);
    // user.companyAddress = await this.buildLocalized(typeof user.companyAddress === "string" ? user.companyAddress : user.companyAddress instanceof Map ? user.companyAddress.get(preferredLang) || "" : user.companyAddress?.[preferredLang] || "", preferredLang, subscribedLangs);

    // if (user.otherLinks) {
    //   user.otherLinks = await Promise.all(
    //     user.otherLinks.map(async (link: any) => ({
    //       title: (await this.buildLocalized(typeof link.title === "string" ? link.title : link.title instanceof Map ? link.title.get(preferredLang) || "" : link.title?.[preferredLang] || "", preferredLang, subscribedLangs)) ?? {},
    //       url: String(link.url),
    //     }))
    //   );
    // }

    // if (user.documents) {
    //   user.documents = await Promise.all(
    //     user.documents.map(async (doc: any) => ({
    //       title: (await this.buildLocalized(typeof doc.title === "string" ? doc.title : doc.title instanceof Map ? doc.title.get(preferredLang) || "" : doc.title?.[preferredLang] || "", preferredLang, subscribedLangs)) ?? {},
    //       url: String(doc.url),
    //       _id: doc._id,
    //     }))
    //   );
    // }
    
    // Finally, update the user record
    console.log("Final user object to be saved:", user);
    await this.userRepo.update(userId, user);
    return user;
  }

  public async unsubscribeLanguage(userId: string, language: string, uid: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: User ID does not match");
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
            _id: doc._id,
          }))
        );
      }
    }

    user.updatedAt = new Date();
    console.log("Final user object to be saved after unsubscription:", user);

    await this.userRepo.update(userId, user);
    return user;
  }

  public async removeProfileImage(userId: string, uid: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);

    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: User ID does not match");
    }

    await deleteMedia(userId, "PROFILE", user.profileImageURL || "");

    user.profileImageURL = "";
    user.updatedAt = new Date();

    await this.userRepo.update(userId, user);
    return user;

  }

  // public async getPreSignURL(userId: string, fileExtension: string, uid: string, title: string, type: string): Promise<{ uploadURL: string; fileURL: string } | null> {
  //   const user = await this.userRepo.findById(userId);
  //   if (!user) throw new NotFoundError("User not found");

  //   if (!user.uid || user.uid !== uid) {
  //     throw new AuthorizationError("Unauthorized: Auth0 ID does not match");
  //   }

  //   if (type === "DOCUMENT" && (!user.subscriptionId || user.subscriptionId === null)) {
  //       throw new BadRequestError("No subscription plan associated with user for document uploads");
  //   }

  //   if (type === "DOCUMENT" && user.subscriptionId) {
  //       const subscriptionPlan = await this.subscriptionPlanRepo.findById(user.subscriptionId);

  //       if (!subscriptionPlan) {
  //         throw new NotFoundError("Subscription plan not found");
  //       }

  //       const docLimit = subscriptionPlan.document_upload_limit || 0;
  //       const existingDocCount = user.documents ? user.documents.length : 0;

  //       if (existingDocCount >= docLimit) {
  //         throw new BadRequestError(`Document upload limit reached. Limit: ${docLimit}`);
  //       }
  //   }

  //   const res = await getPreSignedURL(userId, fileExtension, type);
  //   if (res.status === 0 && res.data) {
  //     const { DocumentURL, DocumentKey } = res.data as { DocumentURL: string; DocumentKey: string };

  //     if (type === "DOCUMENT") {
  //       user.documents = user.documents || [];
  //       const newDocuments = { title: (await this.buildLocalized(title, language, user.languageSubscriptionList || ["en"])) || {}, url: DocumentKey };
  //       user.documents.push(newDocuments);
  //     } else if (type === "PROFILE") {
  //       user.profileImageURL = DocumentKey;
  //     }
      
  //     user.updatedAt = new Date();

  //     await this.userRepo.update(userId, user);

  //     return { uploadURL: DocumentURL, fileURL: DocumentKey };
  //   } else {
  //     throw new Error("Failed to generate pre-signed URL");
  //   }
  // }

  public async deleteDocument(userId: string, documentId: string, uid: string, type: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: User ID does not match");
    }

    console.log("User documents before deletion:", user.documents);
    console.log("Document ID to delete:", documentId);

    const document = user.documents?.find(doc => doc._id?.toString() === documentId);
    if (!document) {
      throw new NotFoundError("Document not found");
    }
    user.documents = user.documents?.filter(doc => doc._id?.toString() !== documentId) || [];
    user.updatedAt = new Date();
    await deleteMedia(userId, type, document.url);
    await this.userRepo.update(userId, user);
    return user;
  }

  public async getPreSignURL( userId: string, fileExtension: string, uid: string, title: Record<string, string>, type: string): Promise<{ uploadURL: string; fileURL: string } | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: Auth0 ID does not match");
    }

    if (type === "DOCUMENT" && (!user.subscriptionId || user.subscriptionId === null)) {
      throw new BadRequestError("No subscription plan associated with user for document uploads");
    }

    if (type === "DOCUMENT" && user.subscriptionId) {
      const subscriptionPlan = await this.subscriptionPlanRepo.findById(user.subscriptionId);
      if (!subscriptionPlan) throw new NotFoundError("Subscription plan not found");

      const docLimit = subscriptionPlan.document_upload_limit || 0;
      const existingDocCount = user.documents ? user.documents.length : 0;
      if (existingDocCount >= docLimit) {
        throw new BadRequestError(`Document upload limit reached. Limit: ${docLimit}`);
      }
    }

    const res = await getPreSignedURL(userId, fileExtension, type);
    if (res.status === 0 && res.data) {
      const { DocumentURL, DocumentKey } = res.data as { DocumentURL: string; DocumentKey: string };

      if (type === "DOCUMENT") {
        user.documents = user.documents || [];

        // Create new doc with merged titles
        const newDocuments = {
          title: {},  // will hold merged langs
          url: DocumentKey,
        };

        // Merge if already exists for same file (by url or title)
        const existingDoc = user.documents.find(doc => doc.url === DocumentKey);

        if (existingDoc) {
          newDocuments.title = { ...existingDoc.title, ...title }; // merge old + new
        } else {
          newDocuments.title = { ...title }; // just take new if none exists
          user.documents.push(newDocuments);
        }

        // Replace existing if found, otherwise just push
        if (existingDoc) {
          Object.assign(existingDoc, newDocuments);
        }
      } else if (type === "PROFILE") {
        user.profileImageURL = DocumentKey;
      }

      user.updatedAt = new Date();
      await this.userRepo.update(userId, user);

      return { uploadURL: DocumentURL, fileURL: DocumentKey };
    } else {
      throw new Error("Failed to generate pre-signed URL");
    }
  }

  // public async updateDocumentTitle(userId: string, documentId: string, title: Record<string, string>, uid: string): Promise<IUser | null> {
  //   const user = await this.userRepo.findById(userId);
    
  //   if (!user) throw new NotFoundError("User not found");

  //   if (!user.uid || user.uid !== uid) {
  //     throw new AuthorizationError("Unauthorized: User ID does not match");
  //   }

  //   const document = user.documents?.find(doc => doc._id?.toString() === documentId);

  //   if (!document) {
  //     throw new NotFoundError("Document not found");
  //   }

  //   const subscribedLangs = user.languageSubscriptionList || ["en"];

  //   for (const lang of Object.keys(title)) {
  //     if (!subscribedLangs.includes(lang)) {
  //       throw new BadRequestError(`Language ${lang} not subscribed`);
  //     }
  //     document.title = { ...document.title, ...title }; // merge & overwrite same lang
  //   }

  //   user.updatedAt = new Date();
  //   await this.userRepo.update(userId, user);
  //   return user;
  // }

  public async updateDocumentTitle(userId: string, documentId: string, title: Record<string, string>, uid: string): Promise<IUser | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.uid || user.uid !== uid) {
      throw new AuthorizationError("Unauthorized: User ID does not match");
    }

    const document = user.documents?.find(doc => doc._id?.toString() === documentId);
    if (!document) throw new NotFoundError("Document not found");

    const subscribedLangs = user.languageSubscriptionList || ["en"];

    // Validate all incoming languages first
    for (const lang of Object.keys(title)) {
      if (!subscribedLangs.includes(lang)) {
        throw new BadRequestError(`Language ${lang} not subscribed`);
      }
    }

    // ✅ Update existing keys and add new ones
    Object.assign(document.title, title);

    // ✅ Explicitly tell Mongoose that nested field changed
    (user as any).markModified(`documents`);

    user.updatedAt = new Date();
    await this.userRepo.update(userId, user);

    return user;
  }

}
