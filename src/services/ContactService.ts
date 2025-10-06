import { log } from "console";
import ContactRepository from "../repositories/ContactRepository";
import UserRepository from "../repositories/UserRepository";
import { AuthorizationError } from "../errors/AuthorizationError";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { ContactResDto } from "../dtos/ContactResDto";

export class ContactService {
  private repo = new ContactRepository();
  private userRepo = new UserRepository();

  async saveContact(userId: string, profileId: string, uid: string, templateId: string, language: string) {

    // await this.authorizeUser(userId, uid);

    const user = await UserRepository.findUserByUid(uid);

    if (!user) throw new Error("User not found");

    const loggedInUserId = user.id;

    if (userId !== loggedInUserId) {
      console.log(`Authorization failed: userId ${userId} does not match loggedInUserId ${loggedInUserId}`);
      // throw new Error("Unauthorized action");
      throw new AuthorizationError("Unauthorized action");
    }

    if (userId === profileId) { 
      throw new BadRequestError("Cannot save your own profile as a contact"); 
    }

    const alreadySaved = await this.repo.isSaved(userId, profileId);
    if (alreadySaved) throw new BadRequestError("Contact already saved");

    return await this.repo.create({ 
      user_id: userId, 
      profile_id: profileId, 
      template_id: templateId, 
      profile_details: { 
        name: [{ langCode: language, value: user.name?.[language] || "" }], 
        email: user.email || "", 
        phone: user.phoneNumber || ""  
      } 
    });
  }

  async getContacts(userId: string, uid: string) {
    await this.authorizeUser(userId, uid);

    return await this.repo.findByUser(userId);
  }

  async removeContact(contactId: string, uid: string) {
    const user = await UserRepository.findUserByUid(uid);
    if (!user) throw new NotFoundError("User not found");

    const loggedInUserId = user.id;

    const contact = await this.repo.findById(contactId);

    if (!contact) throw new NotFoundError("Contact not found");

    if (contact.user_id !== loggedInUserId) throw new AuthorizationError("Unauthorized action");

    return await this.repo.delete(contactId);
  }

  async checkSaved(userId: string, profileId: string, uid: string) {
    await this.authorizeUser(userId, uid);

    return await this.repo.isSaved(userId, profileId);
  }

  private async authorizeUser(userId: string, uid: string) {
    const user = await UserRepository.findUserByUid(uid);
    if (!user) throw new Error("User not found");

    const loggedInUserId = user.id;
    if (userId !== loggedInUserId) {
      console.log(`Authorization failed: userId ${userId} does not match loggedInUserId ${loggedInUserId}`);
      // throw new Error("Unauthorized action");
      throw new AuthorizationError("Unauthorized action");
    }

    return true;
  }

  async getContactById(contactId: string, uid: string) {
    const user = await UserRepository.findUserByUid(uid);

    if (!user) throw new NotFoundError("User not found");

    const loggedInUserId = user.id;

    const contact = await this.repo.findById(contactId);

    if (!contact) throw new NotFoundError("Contact not found");

    if (contact.user_id !== loggedInUserId) throw new AuthorizationError("Unauthorized action");

    const contactUser = await this.userRepo.findById(contact.profile_id);

    if (!contactUser) throw new NotFoundError("Contact user not found");

    if (contactUser.isDeleted){

      return {
        _id: contact._id,
        user_id: contact.user_id,
        profile_id: contact.profile_id,
        template_id: contact.template_id,
        saved_at: contact.saved_at,
        profile_details: contact.profile_details,
      };

    } else {

      return {
        _id: contact._id,
        user_id: contact.user_id,
        profile_id: contact.profile_id,
        template_id: contact.template_id,
        saved_at: contact.saved_at,
        profile_details: contact.profile_details,
        user_details: {
          uid: user.uid,
          personalAddress: user.personalAddress,
          personalWebsite: user.personalWebsite,
          companyName: user.companyName,
          jobTitle: user.jobTitle,
          companyEmail: user.companyEmail,
          companyPhoneNumber: user.companyPhoneNumber,
          companyAddress: user.companyAddress,
          companyWebsite: user.companyWebsite,
          whatsappNumber: user.whatsappNumber,
          facebookUrl: user.facebookUrl,
          instagramUrl: user.instagramUrl,
          linkedInUrl: user.linkedInUrl,
          tikTokUrl: user.tikTokUrl,
          youtubeUrl: user.youtubeUrl,
          otherLinks: user.otherLinks,
          documents: user.documents,
          subscriptionId: user.subscriptionId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isDeleted: user.isDeleted,
          languageSubscriptionList: user.languageSubscriptionList,
          lastPaymentDate: user.lastPaymentDate,
          nextPaymentDate: user.nextPaymentDate,
          paymentSubscriptionType: user.paymentSubscriptionType
        }
      };
    }
  }
}
