import { ReactRouter, RootRoute, Route } from "@tanstack/react-router";
import { indexRoute } from "./routes";
import { userContactsRoute } from "./routes/authenticated";
import { userContactsIndexRoute } from "./routes/authenticated/userContacts";
import { guestRoute } from "./routes/guest";
import { guestIndexRoute } from "./routes/guest/guestContacts";

export const rootRoute = new RootRoute();

const routeTree = rootRoute.addChildren([
  indexRoute,
  guestRoute.addChildren([guestIndexRoute]),
  userContactsRoute.addChildren([userContactsIndexRoute]),
]);

const router = new ReactRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    // This infers the type of our router and registers it across your entire project
    router: typeof router;
  }
}

export default router;
