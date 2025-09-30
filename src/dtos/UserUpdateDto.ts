import { Express } from 'express';

type MulterFile = Express.Multer.File;

export interface UserCreateDto {
  id: string;
  name?: string;
  phoneNumber?: string;
  personalAddress?: string;
  personalWebsite?: string;
  companyName?: string;
  jobTitle?: string;
  companyEmail?: string;
  companyPhoneNumber?: string;
  companyAddress?: string;
  companyWebsite?: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  tikTokUrl?: string;
  youtubeUrl?: string;
  profileImage?: MulterFile;
  otherLinks?: { title: string; url: string }[];
  newDocuments?: { title: string; file: MulterFile }[];
  existingDocuments?: { title: string; url: string }[];
  language: string; // Primary language code
}
