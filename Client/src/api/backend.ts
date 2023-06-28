import {
  ContactResponse,
  CreateContactRequest,
  GuestUser,
  UpsertContactRequest,
} from "../contracts/contact";

interface ContactService {
  getAll: (token: string) => Promise<ContactResponse[]>;
  get: (id: number, token: string) => Promise<ContactResponse>;
  add: (formData: FormData, token: string) => Promise<Response>;
  upsert: (formData: FormData, token: string) => Promise<Response>;
  delete: (id: number, token: string) => Promise<Response>;
}

interface GuestService {
  getContacts: () => Promise<ContactResponse[]>;
}

interface UserService {
  get: (token: string) => Promise<Response>;
}

const getBaseUrl = () => {
  const productionUrl = "";
  const devUrl = "";

  if (import.meta.env.MODE === "preview") return devUrl;
  if (import.meta.env.PROD) return productionUrl;
  return devUrl;
};

const API_BASE_URL = getBaseUrl();

const fetchBackend = async ({
  route,
  options,
  token,
}: {
  route: string;
  options?: RequestInit;
  token?: string;
}) => {
  const defaultHeaders = token
    ? {
        ...options?.headers,
        Authorization: `Bearer ${token}`,
      }
    : ({
        ...options?.headers,
      } as HeadersInit);

  const defaultOptions: RequestInit = {
    ...options,
    headers: defaultHeaders,
  };
  const response = await fetch(API_BASE_URL + route, defaultOptions);

  if (!response.ok) new Error(`Failed to fetch backend at /${route} `);

  return response;
};

const contactService: ContactService = {
  getAll: async (token: string): Promise<ContactResponse[]> => {
    const response = await fetchBackend({
      route: "contact",
      token,
      options: {
        headers: {
          "content-type": "application/json",
        },
      },
    });

    return response.json() as Promise<ContactResponse[]>;
  },

  get: async (id: number, token: string): Promise<ContactResponse> => {
    const response = await fetchBackend({
      route: `contact/${id}`,
      token,
      options: {
        headers: {
          "content-type": "application/json",
        },
      },
    });
    return response.json() as Promise<ContactResponse>;
  },

  add: (formData: FormData, token: string): Promise<Response> => {
    return fetchBackend({
      route: "contact",
      options: {
        method: "POST",
        body: formData,
      },
      token,
    });
  },

  upsert: (formData: FormData, token: string): Promise<Response> => {
    return fetchBackend({
      route: "contact",
      options: {
        method: "PUT",
        body: formData,
      },
      token,
    });
  },

  delete: (id: number, token: string): Promise<Response> => {
    return fetchBackend({
      route: `contact/${id}`,
      options: {
        method: "DELETE",
      },
      token,
    });
  },
};

const guestService: GuestService = {
  getContacts: async (): Promise<ContactResponse[]> => {
    const res = await fetchBackend({
      route: "guest/contacts",
      options: {
        headers: {
          "content-type": "application/json",
        },
      },
    });
    return res.json() as Promise<ContactResponse[]>;
  },
};

const userService: UserService = {
  get: async (token: string): Promise<Response> => {
    return await fetchBackend({
      route: "user",
      token,
      options: {
        headers: {
          "content-type": "application/json",
        },
      },
    });
  },
};

export { contactService, guestService, userService };
