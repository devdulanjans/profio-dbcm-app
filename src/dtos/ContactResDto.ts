import { Schema, model, Document, ObjectId, Types } from "mongoose";

export interface ILocalizedField {
  [langCode: string]: string; // e.g. { "en": "Resume", "sp": "Currículum" }
}

export interface ContactResDto {
  _id: Types.ObjectId;
  user_id: string;      // Who saved the contact (e.g., John)
  profile_id: string;   // Whose profile was saved (e.g., Kevin’s profile)
  template_id?: string; // Optional: Which template was used
  saved_at: Date;
  profile_details: {
    name: { langCode: string; value: string }[];
    email: string;
    phone: string;
  };
  user_details?: {
    uid: string;
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
    lastPaymentDate?: Date;
    nextPaymentDate?: Date;
    paymentSubscriptionType?: string; // e.g. "MONTHLY", "YEARLY"
  }
}