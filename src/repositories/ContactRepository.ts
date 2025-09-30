import Contact, { IContact } from "../models/Contact";

export default class ContactRepository {
  public async create(contact: Partial<IContact>): Promise<IContact> {
    return await Contact.create(contact);
  }

  public async findByUser(userId: string) {
    return await Contact.find({ user_id: userId }).populate("profile_id");
  }

  public async findById(contactId: string) {
    return await Contact.findById(contactId);
  }

  public async delete(contactId: string) {
    return await Contact.findByIdAndDelete(contactId);
  }

  public async isSaved(userId: string, profileId: string) {
    return await Contact.exists({ user_id: userId, profile_id: profileId });
  }
}
