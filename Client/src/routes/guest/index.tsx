import { Outlet, Route } from "@tanstack/react-router";
import { rootRoute } from "../../router";
import BaseHeader from "../../components/BaseHeader";

export const guestRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "guest",
  component: () => {
    return (
      <>
        <BaseHeader
          user={{
            isGuest: true,
          }}
        />
        <Outlet />
      </>
    );
  },
});
