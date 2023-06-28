import { Route } from "@tanstack/react-router";
import { guestRoute } from "./index";
import useGuestContacts from "../../hooks/useGuestContacts";
import ContactInterface from "../../components/contact/ContactInterface";
import LoadingSpinner from "../../components/LoadingSpinner";

export const guestIndexRoute = new Route({
  getParentRoute: () => guestRoute,
  path: "/",
  component: guestContacts,
});

function guestContacts() {
  const {
    guestContacts,
    addGuestContact,
    updateGuestContact,
    deleteGuestContact,
    isLoading,
  } = useGuestContacts();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="max-w-screen-lg mx-auto my-10">
      <ContactInterface
        contacts={guestContacts}
        methods={{
          addContact: addGuestContact,
          editContact: updateGuestContact,
          deleteContact: deleteGuestContact,
        }}
      />
    </main>
  );
}
