import { useMemo, useState } from "react";
import {
  ContactResponse,
} from "../../contracts/contact";
import ContactModal from "./ContactModal";
import ContactRow from "./ContactRow";
import SearchIcon from "../icons/SearchIcon";

interface ContactInterfaceProps {
  contacts?: ContactResponse[];
  methods: {
    editContact: (formData: FormData) => void;
    deleteContact: (id: number) => void;
    addContact: (formData: FormData) => void;
  };
}

const filterContacts = (
  contacts: ContactResponse[],
  searchTerm: string
): ContactResponse[] => {
  const filteredContacts: ContactResponse[] = [];

  for (let i = 0; i < contacts.length; i++) {
    let fullName: string;

    if (contacts[i].lastName) {
      fullName = `${contacts[i].firstName} ${contacts[i].lastName}`;
    } else {
      fullName = contacts[i].firstName;
    }

    if (fullName.toLowerCase().includes(searchTerm.toLowerCase())) {
      filteredContacts.push(contacts[i]);
    }
  }

  return filteredContacts;
};

const groupAndSortContacts = (
  contacts: ContactResponse[]
): Record<string, ContactResponse[]> => {
  const groups = {} as Record<string, ContactResponse[]>;

  for (let i = 0; i < contacts.length; i++) {
    const firstLetter = contacts[i].firstName[0].toUpperCase();
    if (groups[firstLetter]) {
      groups[firstLetter].push(contacts[i]);
    } else {
      groups[firstLetter] = [contacts[i]];
    }
  }

  const sorted = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(sorted);
};

export default function ContactInterface({
  contacts,
  methods: { addContact, deleteContact, editContact },
}: ContactInterfaceProps) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [searchValue, setSearchVaule] = useState("");

  const contactListMemo = useMemo(() => {
    if (!contacts || contacts.length === 0) {
      return (
        <h3>
          You have no saved contacts. Click the Add button to add a contact!
        </h3>
      );
    }
    return Object.entries(
      groupAndSortContacts(filterContacts(contacts, searchValue))
    ).map(([key, value]) => {
      return (
        <div key={crypto.randomUUID()}>
          <div className="flex gap-1 items-center">
            <span className="text-3xl text-brand text-opacity-60">{key}</span>
            <span className="w-full h-px bg-brand bg-opacity-30 rounded-full"></span>
          </div>

          <div className="ml-9 flex flex-col gap-2">
            {value.map((contact) => (
              <ContactRow
                contact={contact}
                key={crypto.randomUUID()}
                editContact={editContact}
                deleteContact={deleteContact}
              />
            ))}
          </div>
        </div>
      );
    });
  }, [contacts, searchValue, editContact, deleteContact]);

  return (
    <div>
      <div className="flex justify-between items-center">
        {/* Search goes here */}
        <div className="flex gap-3 items-center">
          <SearchIcon />
          <input
            name={"contactSearch"}
            value={searchValue}
            id={"contactSearch"}
            onChange={(e) => {
              setSearchVaule(e.target.value);
            }}
            className="block w-64 rounded-full shadow-inner shadow-slate-300 border-gray-300 px-4 py-1 sm:text-md focus:outline-dark-accent dark:bg-slate-700 dark:shadow-slate-800"
            placeholder={"Search by name"}
          />
        </div>

        <button
          className="ml-auto bg-brand text-light-shade  rounded-full cursor-pointer hover:opacity-90 tracking-wider font-semibold w-10 h-10 flex justify-center items-center relative p-6"
          onClick={() => {
            setAddModalOpen(true);
          }}
        >
          <span className="absolute w-0.5 h-5 rounded-full bg-light-shade  rotate-90"></span>
          <span className="absolute w-0.5 h-5 rounded-full bg-light-shade"></span>
        </button>
      </div>
      <div className="flex  flex-col gap-2 mt-2">
        {contactListMemo}
        {addModalOpen && (
          <ContactModal
            closeModal={() => {
              setAddModalOpen(false);
            }}
            onSave={(formData) => {
              addContact(formData);
            }}
          />
        )}
      </div>
    </div>
  );
}
