import { Schema, model, Document, ObjectId } from "mongoose";

export interface ILocalizedField {
  [langCode: string]: string; // e.g. { "en": "John", "sp": "Juan" }
}

export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  auth0Id: string;
  shareURLName?: string;
  phoneNumber?: string;
  personalWebsite?: string;
  companyEmail?: string;
  companyPhoneNumber?: string;
  companyWebsite?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  tikTokUrl?: string;
  youtubeUrl?: string;
  profileImageURL?: string;
  subscriptionId?: string; // Reference to subscriptions.code
  languageSubscriptionList?: string[]; // List of language codes
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;


  name?: ILocalizedField;
  personalAddress?: ILocalizedField;
  companyName?: ILocalizedField;
  jobTitle?: ILocalizedField;
  companyAddress?: ILocalizedField;
  otherLinks?: { title: ILocalizedField; url: string }[];
  documents?: { title: ILocalizedField; url: string }[];
  
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  auth0Id: { type: String, required: true, unique: true },
  name: { type: Map, required: false, default: {} },
  shareURLName: { type: String, required: false, default: "" },
  phoneNumber: { type: String, required: false, default: "" },
  personalAddress: { type: Map, required: false, default: {} },
  personalWebsite: { type: String, required: false, default: "" },
  companyName: { type: Map, required: false, default: {} },
  jobTitle: { type: Map, required: false, default: {} },
  companyEmail: { type: String, required: false, default: "" },
  companyPhoneNumber: { type: String, required: false, default: "" },
  companyAddress: { type: Map, required: false, default: {} },
  companyWebsite: { type: String, required: false, default: "" },
  whatsappNumber: { type: String, required: false, default: "" },
  facebookUrl: { type: String, required: false, default: "" },
  instagramUrl: { type: String, required: false, default: "" },
  linkedInUrl: { type: String, required: false, default: "" },
  tikTokUrl: { type: String, required: false, default: "" },
  youtubeUrl: { type: String, required: false, default: "" },
  profileImageURL: { type: String, required: false, default: "" },
  otherLinks: {
    type: [
      {
        title: { type: Map, required: true, default: {} },
        url: { type: String, required: true, default: "" },
      },
    ],
    default: [],
  },
  documents: {
    type: [
      {
        title: { type: Map, required: true, default: {} },
        url: { type: String, required: true, default: "" },
      },
    ],
    default: [],
  },
  subscriptionId: { type: String, required: false, default: null },
  languageSubscriptionList: { type: [String], required: false, default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false }
});

export default model<IUser>("User", userSchema, "user");