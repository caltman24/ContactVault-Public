import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ContactResponse,
  CreateContactRequest,
  EmailAddress,
  PHONE_TYPES,
  PhoneNumber,
  SOCIAL_PLATFORMS,
  SocialMediaAccount,
  SocialMediaAccountPlatform,
  UpsertContactRequest,
} from "../../contracts/contact";
import useContactForm from "../../hooks/useContactForm";
import { BaseFormInput, InputSelect } from "../forms/FormInput";
import TrashIcon from "../icons/TrashIcon";
import useOutsideClick from "../../hooks/useOutsideClick";
import useFileUpload from "../../hooks/useFileUpload";
import { useAuth0, User } from "@auth0/auth0-react";

interface ContactModalProps {
  closeModal: () => void;
  onSave: (formData: FormData) => void;
  currentContactOptions?: {
    onDelete: () => void;
    currentContact: ContactResponse;
  };
}

const defaultImageUrl = "https://i.stack.imgur.com/l60Hf.png";
export default function ContactModal({
  closeModal,
  onSave,
  currentContactOptions,
}: ContactModalProps) {
  const {
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
  } = useContactForm({
    currentContact: currentContactOptions?.currentContact,
  });

  const {
    upload,
    fileInputRef,
    handleFileChange,
    removeFile,
    sizeExceeded,
    formattedMaxSize,
  } = useFileUpload();

  const [imageCleared, setImageCleared] = useState(false);

  const { user, isAuthenticated } = useAuth0();

  const modalRef = useOutsideClick<HTMLDivElement>({
    setState: closeModal,
  });

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const contactDetails = {
      firstName,
      lastName,
      imageUrl,
      phoneNumbers,
      emailAddresses,
      socialMediaAccounts,
    };

    if (contactDetails.imageUrl === "" && typeof upload === "undefined") {
      contactDetails.imageUrl = defaultImageUrl;
    }

    const formData = new FormData();
    const userExists = isAuthenticated && typeof user !== "undefined";

    if (typeof upload !== "undefined" && userExists) {
      formData.append("Image", upload.file, upload.file.name);
      contactDetails.imageUrl = "";
    }

    // Edit existing contact
    if (currentContactOptions) {
      const updatedContact: UpsertContactRequest = {
        ...contactDetails,
        id: currentContactOptions.currentContact.id,
        deleteImageRequest: imageCleared
      };
      console.log(`Image Cleared bool: ${imageCleared}`, "@ ContactModal handleFormSubmit :99")
      formData.append("Contact", JSON.stringify(updatedContact));

      onSave(formData);
      closeModal();
      return;
    }

    // Add new contact
    formData.append("contact", JSON.stringify(contactDetails));
    onSave(formData);
    closeModal();
  };

  // Handle Phone Number Input Changes
  const handlePhoneNumberChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPhoneNumbers((prev) => {
      const output = [...prev];
      output[index].number = event.target.value;
      return output;
    });
  };

  const handlePhoneNumberTypeChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const updatedPhoneNumbers = [...phoneNumbers];
    updatedPhoneNumbers[index].type = event.target.value as
      | "Work"
      | "Home"
      | "Cell";
    setPhoneNumbers(updatedPhoneNumbers);
  };

  const handleAddPhoneNumber = (phoneNumber: PhoneNumber) => {
    setPhoneNumbers((prev) => [...prev, phoneNumber]);
  };

  const handleDeletePhoneNumber = (index: number) => {
    setPhoneNumbers((prev) => prev.filter((_, i) => index !== i));
  };

  // Handle Email Address Input Changes
  const handleEmailAddressChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEmailAddresses((prev) => {
      const output = [...prev];
      output[index].email = event.target.value;
      return output;
    });
  };

  const handleAddEmailAddress = (emailAddress: EmailAddress) => {
    setEmailAddresses((prev) => [...prev, emailAddress]);
  };

  const handleDeleteEmailAddress = (index: number) => {
    setEmailAddresses((prev) => prev.filter((_, i) => index !== i));
  };

  // Handle Social Media Account Input Changes
  const handleSocialMediaAccountUrlChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSocialMediaAccounts((prev) => {
      const output = [...prev];
      output[index].url = event.target.value;
      return output;
    });
  };

  const handleSocialMediaAccountPlatformChange = (
    index: number,
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSocialMediaAccounts((prev) => {
      const output = [...prev];
      output[index].platform = event.target.value as SocialMediaAccountPlatform;
      return output;
    });
  };

  const handleAddSocialMediaAccount = (account: SocialMediaAccount) => {
    setSocialMediaAccounts((prev) => [...prev, account]);
  };

  const handleDeleteSocialMediaAccount = (index: number) => {
    setSocialMediaAccounts((prev) => prev.filter((_, i) => index !== i));
  };

  const phoneNumberInputs = phoneNumbers.map((pn, index) => {
    return (
      <div className="flex items-center relative" key={index}>
        <InputSelect
          inputOptions={{
            placeholder: "(435)532-5342",
            name: `phoneNumber${index}`,
            id: `phoneNumber${index}`,
            value: pn.number,
            required: true,
            type: "text",
            onChange: (e) => {
              handlePhoneNumberChange(index, e);
            },
          }}
          selectOptions={{
            id: `phoneNumberTypes${index}`,
            name: `phoneNumberTypes${index}`,
            label: "Phone Number Type",
            value: pn.type,
            onChange: (e) => {
              handlePhoneNumberTypeChange(index, e);
            },
            options: Object.values(PHONE_TYPES).map((t) => {
              return { label: t, value: t };
            }),
          }}
        />
        <TrashIcon
          size={24}
          className="absolute -right-8"
          onClick={() => {
            handleDeletePhoneNumber(index);
          }}
        />
      </div>
    );
  });

  const emailAddressInputs = emailAddresses.map((email, index) => {
    return (
      <div className="flex items-center relative" key={index}>
        <BaseFormInput
          placeholder="johndoe123@johndoe.com"
          name={`emailAddress${index}`}
          id={`emailAddress${index}`}
          value={email.email}
          type="email"
          onChange={(e) => {
            handleEmailAddressChange(index, e);
          }}
          required={true}
        />
        <TrashIcon
          size={24}
          className="absolute -right-8"
          onClick={() => {
            handleDeleteEmailAddress(index);
          }}
        />
      </div>
    );
  });

  const socialMediaAccountInputs = socialMediaAccounts.map((account, index) => {
    return (
      <div className="flex items-center relative" key={index}>
        <InputSelect
          inputOptions={{
            placeholder: "https://facebook.com/accounturl",
            name: `socialMediaAccount${index}`,
            id: `socialMediaAccount${index}`,
            value: account.url,
            required: true,
            type: "url",
            onChange: (e) => {
              handleSocialMediaAccountUrlChange(index, e);
            },
          }}
          selectOptions={{
            id: `socialMediaAccountPlatform${index}`,
            name: `socialMediaAccountPlatform${index}`,
            label: "Phone Number Type",
            value: account.platform,
            onChange: (e) => {
              handleSocialMediaAccountPlatformChange(index, e);
            },
            options: Object.values(SOCIAL_PLATFORMS).map((v) => {
              return { label: v, value: v };
            }),
          }}
        />
        <TrashIcon
          size={24}
          className="absolute -right-8"
          onClick={() => {
            handleDeleteSocialMediaAccount(index);
          }}
        />
      </div>
    );
  });

  const AvatarUpload = () => {
    return (
      <div className="w-52 h-52 relative image_overlay my-3">
        <img
          src={imageUrl}
          alt=""
          className="opacity-100 block w-full h-full object-cover transition-transform image rounded-full "
        />
        <div
          className="opacity-0 absolute top-1/2 left-1/2 w-full h-full text-center overlay"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <div className="py-3 px-5 rounded-full w-full h-full font-semibold relative">
            <label
              htmlFor="uploadImage"
              className="absolute top-1/2 left-1/2"
              style={{
                transform: "translate(-50%, -50%)",
                transition: "0.5s ease",
              }}
            >
              Upload Image
            </label>
            <input
              type="file"
              accept="image/png, image/jpeg"
              name="uploadImage"
              id="uploadImage"
              className="opacity-0 w-full h-full cursor-pointer"
              onChange={(e) => {
                handleFileChange(e, (preview) => {
                  // FIXME: We want a seperate preview state isntead of imageUrl
                  setImageUrl(preview as string);
                  setImageCleared(false);
                  console.log("image cleared false");
                  return;
                });
              }}
              ref={fileInputRef}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative z-10"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity"></div>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full justify-center text-center items-center p-2">
          <div className="relative transform overflow-hidden rounded-lg bg-white  text-left shadow-xl transition-all my-8 w-full max-w-5xl">
            <div className="bg-gray-50 dark:bg-dark-shade px-5 py-3 sm:py-10 flex sm:px-10">
              <div
                className="max-md:grid-cols-1 grid grid-cols-4 w-full gap-y-8"
                ref={modalRef}
              >
                <div className="flex flex-col items-center text-center col-span-1">
                  {sizeExceeded && (
                    <span className="text-red-600">
                      Max file size is {formattedMaxSize()}
                    </span>
                  )}
                  <AvatarUpload />
                  {/* Do not show clear image button when the image url is default */}
                  {imageUrl !== defaultImageUrl && <button
                    className="dark:bg-zinc-800 dark:hover:bg-opacity-70 bg-zinc-200 hover:bg-zinc-300 py-2 px-4 rounded-lg text-sm"
                    onClick={() => {
                      console.log(imageUrl)
                      if (imageUrl === defaultImageUrl) return

                      if (upload?.file) {
                        removeFile();
                      } else {
                        setImageCleared(true);
                        console.log('image cleared true')
                      }

                      setImageUrl(defaultImageUrl);
                    }}
                  >
                    Clear Image
                  </button>}
                </div>

                <div className="col-span-3 max-md:pr-5 md:px-10 flex justify-center w-full">
                  <form onSubmit={handleFormSubmit}>
                    {/* --- First & Last Name --- */}
                    <div className="flex gap-8">
                      <BaseFormInput
                        label={"First Name"}
                        placeholder={"John"}
                        name={"firstName"}
                        id={"firstName"}
                        required={true}
                        value={firstName}
                        onChange={(e) => {
                          setFirstName(e.target.value);
                        }}
                      />
                      <BaseFormInput
                        label={"Last Name"}
                        placeholder={"Doe"}
                        name={"lastName"}
                        id={"lastName"}
                        value={lastName}
                        onChange={(e) => {
                          setLastName(e.target.value);
                        }}
                      />
                    </div>

                    {/* --- Phone Numbers --- */}
                    <div
                      className="my-4 flex gap-2 font-semibold items-center cursor-pointer"
                      onClick={() => {
                        handleAddPhoneNumber({ number: "", type: "Work" });
                      }}
                    >
                      <span>Phone Numbers</span>
                      <span className="font-semibold">+</span>
                    </div>
                    {phoneNumberInputs}

                    {/* --- Email Addresses --- */}
                    <div
                      className="my-4 flex gap-2 font-semibold items-center  cursor-pointer"
                      onClick={() => {
                        handleAddEmailAddress({ email: "" });
                      }}
                    >
                      <span>Email Addresses</span>
                      <span className="font-semibold">+</span>
                    </div>
                    {emailAddressInputs}

                    {/* --- Social Media Accounts --- */}
                    <div
                      className="my-4 flex gap-2 font-semibold items-center  cursor-pointer"
                      onClick={() => {
                        handleAddSocialMediaAccount({
                          platform: "Facebook",
                          url: "",
                        });
                      }}
                    >
                      <span>Social Media Accounts</span>
                      <span className="font-semibold">+</span>
                    </div>
                    {socialMediaAccountInputs}

                    {/* Save & Close */}
                    <div
                      className={`flex mt-20 items-center ${currentContactOptions
                        ? "justify-between"
                        : "justify-end"
                        }`}
                    >
                      {currentContactOptions && (
                        <button
                          className="bg-red-600 text-light-shade px-4 py-2 rounded-md cursor-pointer hover:opacity-90  font-semibold"
                          type="button"
                          onClick={() => {
                            currentContactOptions.onDelete();
                          }}
                        >
                          Delete
                        </button>
                      )}
                      <div className="flex gap-5">
                        <button
                          type="submit"
                          className="bg-brand text-light-shade px-4 py-2 rounded-md cursor-pointer hover:opacity-90  font-semibold"
                        >
                          Save
                        </button>
                        <button
                          className="bg-transparent border-dark-shade border text-dark-shade px-4 py-2 rounded-md  cursor-pointer hover:opacity-70 font-semibold dark:border-light-shade dark:text-light-shade"
                          type="button"
                          onClick={() => {
                            closeModal();
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
