import { useState } from "react";
import { ContactResponse, UpsertContactRequest } from "../../contracts/contact";
import ContactModal from "./ContactModal";

interface ContactRowProps {
  contact: ContactResponse;
  editContact: (formData: FormData) => void;
  deleteContact: (id: number) => void;
}
export default function ContactRow({
  contact,
  editContact,
  deleteContact,
}: ContactRowProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        className="border-px p-2 cursor-pointer hover:bg-slate-100 rounded-lg bg-white dark:bg-zinc-800 shadow-sm"
        onClick={() => {
          setModalOpen(true);
        }}
      >
        <div className="flex items-center gap-5">
          <div className="w-7 h-7">
            <img
              src={contact.imageUrl!}
              className="rounded-full object-cover w-full h-full"
            />
          </div>
          <span>
            {contact.firstName} {contact.lastName}
          </span>
        </div>
      </div>
      {modalOpen && (
        <ContactModal
          closeModal={() => {
            setModalOpen(false);
          }}
          onSave={(formData) => {
            editContact(formData);
          }}
          currentContactOptions={{
            currentContact: contact,
            onDelete: () => {
              deleteContact(contact.id);
              setModalOpen(false);
            },
          }}
        />
      )}
    </>
  );
}
