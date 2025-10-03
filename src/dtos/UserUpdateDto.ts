import { ILocalizedField } from "./UserDto";

export interface UserCreateDto {
  id: string;
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
}
