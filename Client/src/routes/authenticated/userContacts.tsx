import { useAuth0 } from "@auth0/auth0-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Route } from "@tanstack/react-router";
import { userContactsRoute } from ".";
import { contactService } from "../../api/backend";
import ContactInterface from "../../components/contact/ContactInterface";
import LoadingSpinner from "../../components/LoadingSpinner";

export const userContactsIndexRoute = new Route({
  getParentRoute: () => userContactsRoute,
  path: "/",
  component: UserContacts,
});

function UserContacts() {
  const { getAccessTokenSilently } = useAuth0();

  const getUserContacts = async () => {
    const token = await getAccessTokenSilently();
    const contacts = await contactService.getAll(token);
    return contacts;
  };

  const {
    data: contacts,
    error: queryError,
    isLoading,
    refetch: refetchContacts,
  } = useQuery({
    queryKey: ["userContacts"],
    queryFn: getUserContacts,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
  });

  const { mutateAsync: addUserContact } = useMutation({
    mutationKey: ["addUserContact"],
    mutationFn: async (formData: FormData) => {
      const token = await getAccessTokenSilently();
      await contactService.add(formData, token);
    },
  });

  const { mutateAsync: updateUserContact } = useMutation({
    mutationKey: ["updateUserContact"],
    mutationFn: async (formData: FormData) => {
      const token = await getAccessTokenSilently();
      await contactService.upsert(formData, token);
    },
  });

  const { mutateAsync: deleteUserContact } = useMutation({
    mutationKey: ["deleteUserContact"],
    mutationFn: async (id: number) => {
      const token = await getAccessTokenSilently();
      await contactService.delete(id, token);
    },
  });

  return (
    <>
      <main className="max-w-screen-lg mx-auto my-10">
        {queryError ? (
          <h3 className="text-red-700">Failed to fetch contacts</h3>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <ContactInterface
            contacts={contacts}
            methods={{
              addContact: (formData) => {
                addUserContact(formData).then(() => {
                  refetchContacts();
                });
              },
              editContact: (formData) => {
                updateUserContact(formData).then(() => {
                  refetchContacts();
                });
              },
              deleteContact: (id) => {
                deleteUserContact(id).then(() => {
                  refetchContacts();
                });
              },
            }}
          />
        )}
      </main>
    </>
  );
}
