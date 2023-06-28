import { useState, useEffect } from "react";
import {
  ContactResponse,
  CreateContactRequest,
  UpsertContactRequest,
} from "../contracts/contact";
import { guestService } from "../api/backend";

export default function useGuestContacts() {
  const [guestContacts, setGuestContacts] = useState(() => {
    const item = window.localStorage.getItem("guestContacts");

    return item ? (JSON.parse(item) as ContactResponse[]) : undefined;
  });

  const [isLoading, setIsLoading] = useState(false);

  const setLocalStorage = <T>(data: T) => {
    window.localStorage.setItem("guestContacts", JSON.stringify(data));
  };

  useEffect(() => {
    if (guestContacts) return;

    setIsLoading(true);
    guestService.getContacts().then((data) => {
      setGuestContacts(data);
      setLocalStorage(data);
    });
    setIsLoading(false);
  }, []);

  const addGuestContact = (formData: FormData) => {
    const contactRaw = formData.get("contact");

    if (contactRaw === null) {
      throw new Error("Failed to get contact payload from FromData");
    }
    const contact = JSON.parse(contactRaw.toString()) as CreateContactRequest;

    const newContact: ContactResponse = {
      ...contact,
      id: Math.floor(Math.random() * 10000000000000),
    };
    setGuestContacts((prev) => {
      const output = [newContact, ...prev!];
      setLocalStorage(output);
      return output;
    });
  };

  const deleteGuestContact = (id: number) => {
    setGuestContacts((prev) => {
      const output = prev!.filter((x) => x.id !== id);
      setLocalStorage(output);
      return output;
    });
  };

  const updateGuestContact = (formData: FormData) => {
    const contactRaw = formData.get("contact");

    if (contactRaw === null) {
      throw new Error("Failed to get contact payload from FromData");
    }
    const contact = JSON.parse(contactRaw.toString()) as UpsertContactRequest;
    const newContact: ContactResponse = { ...contact };

    setGuestContacts((prev) => {
      const output = prev!.map((x) => {
        if (x.id === contact.id) x = newContact;
        return x;
      });
      setLocalStorage(output);
      return output;
    });
  };

  return {
    guestContacts,
    isLoading,
    addGuestContact,
    deleteGuestContact,
    updateGuestContact,
  };
}
