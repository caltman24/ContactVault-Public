interface _BaseContact {
  imageUrl: string | undefined;
  firstName: string;
  lastName: string | undefined;
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  socialMediaAccounts: SocialMediaAccount[];
}
export interface ContactResponse extends _BaseContact {
  id: number;
}

export interface CreateContactRequest extends _BaseContact {}

export interface UpsertContactRequest extends _BaseContact {
  id: number;
  deleteImageRequest: boolean;
}

export interface EmailAddress {
  email: string;
}

export interface PhoneNumber {
  number: string;
  type: "Work" | "Home" | "Cell";
}

export interface SocialMediaAccount {
  url: string;
  platform: SocialMediaAccountPlatform;
}

export interface GuestUser {
  userId: string;
}

export type SocialMediaAccountPlatform =
  | "Facebook"
  | "Instagram"
  | "Twitter"
  | "TikTok"
  | "Pinterest"
  | "LinkedIn";
export const SOCIAL_PLATFORMS: { [key: string]: SocialMediaAccountPlatform } = {
  facebook: "Facebook",
  twitter: "Twitter",
  instagram: "Instagram",
  tikTok: "TikTok",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
};

export const PHONE_TYPES: { [key: string]: "Work" | "Home" | "Cell" } = {
  work: "Work",
  home: "Home",
  cell: "Cell",
};
