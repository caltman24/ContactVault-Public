import { useEffect, useState } from "react";
import {
  ContactResponse,
  EmailAddress,
  PhoneNumber,
  SocialMediaAccount,
} from "../contracts/contact";

interface ContactFormOptions {
  currentContact?: ContactResponse;
}

export default function useContactForm(options?: ContactFormOptions) {
  const defaultImageUrl = "https://i.stack.imgur.com/l60Hf.png";

  const contact = options?.currentContact;

  const [firstName, setFirstName] = useState(contact?.firstName ?? "");
  const [lastName, setLastName] = useState(contact?.lastName ?? "");
  const [imageUrl, setImageUrl] = useState(
    contact?.imageUrl ?? defaultImageUrl
  );
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(
    contact?.phoneNumbers ?? []
  );
  const [emailAddresses, setEmailAddresses] = useState<EmailAddress[]>(
    contact?.emailAddresses ?? []
  );
  const [socialMediaAccounts, setSocialMediaAccounts] = useState<
    SocialMediaAccount[]
  >(contact?.socialMediaAccounts ?? []);

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    imageUrl,
    setImageUrl,
    phoneNumbers,
    setPhoneNumbers,
    emailAddresses,
    setEmailAddresses,
    socialMediaAccounts,
    setSocialMediaAccounts,
  };
}
