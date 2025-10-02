import { Schema, model, Document, ObjectId } from "mongoose";

export interface ILocalizedField {
  [langCode: string]: string; // e.g. { "en": "Resume", "sp": "Currículum" }
}

export interface UserDto {
  email: string;
  uid: string;
  name?: ILocalizedField;
  phoneNumber?: string;
  personalAddress?: ILocalizedField;
  personalWebsite?: string;
  companyName?: ILocalizedField;
  jobTitle?: ILocalizedField;
  companyEmail?: string;
  companyPhoneNumber?: string;
  companyAddress?: ILocalizedField;
  companyWebsite?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  tikTokUrl?: string;
  youtubeUrl?: string;
  otherLinks?: { title: ILocalizedField; url: string }[];
  documents?: { title: ILocalizedField; url: string }[];
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  languageSubscriptionList?: string[]; // List of language codes
}
