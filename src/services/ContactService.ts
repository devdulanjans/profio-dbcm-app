import { log } from "console";
import ContactRepository from "../repositories/ContactRepository";
import UserRepository from "../repositories/UserRepository";
import { AuthorizationError } from "../errors/AuthorizationError";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";

export class ContactService {
  private repo = new ContactRepository();

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
}
