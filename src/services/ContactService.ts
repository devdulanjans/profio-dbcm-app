import { log } from "console";
import ContactRepository from "../repositories/ContactRepository";
import UserRepository from "../repositories/UserRepository";
import { AuthorizationError } from "../errors/AuthorizationError";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";

export class ContactService {
  private repo = new ContactRepository();

  async saveContact(userId: string, profileId: string, auth0Id: string, templateId: string) {

    await this.authorizeUser(userId, auth0Id);

    if (userId === profileId) { 
      throw new BadRequestError("Cannot save your own profile as a contact"); 
    }

    const alreadySaved = await this.repo.isSaved(userId, profileId);
    if (alreadySaved) throw new BadRequestError("Contact already saved");

    return await this.repo.create({ user_id: userId, profile_id: profileId, template_id: templateId });
  }

  async getContacts(userId: string, auth0Id: string) {
    await this.authorizeUser(userId, auth0Id);

    return await this.repo.findByUser(userId);
  }

  async removeContact(contactId: string, auth0Id: string) {
    const user = await UserRepository.findUserByAuth0Id(auth0Id);
    if (!user) throw new NotFoundError("User not found");

    const loggedInUserId = user.id;

    const contact = await this.repo.findById(contactId);

    if (!contact) throw new NotFoundError("Contact not found");

    if (contact.user_id !== loggedInUserId) throw new AuthorizationError("Unauthorized action");

    return await this.repo.delete(contactId);
  }

  async checkSaved(userId: string, profileId: string, auth0Id: string) {
    await this.authorizeUser(userId, auth0Id);

    return await this.repo.isSaved(userId, profileId);
  }

  private async authorizeUser(userId: string, auth0Id: string) {
    const user = await UserRepository.findUserByAuth0Id(auth0Id);
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
