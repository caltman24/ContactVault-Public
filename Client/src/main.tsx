import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import router from "./router";
import "./index.css";
import { Auth0Provider } from "@auth0/auth0-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  document.documentElement.classList.add("dark");

  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <Auth0Provider
        domain="dev-wo5np8pa74qkv8lk.us.auth0.com"
        clientId="mOV3vGstxGK7NCPHKCDrGtmxG8N0lB6A"
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: "https://contactvault.api",
          scope: "read:user manage:contacts profile openid",
        }}
      >
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Auth0Provider>
    </StrictMode>
  );
}
