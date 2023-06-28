import { Navigate, Outlet, Route } from "@tanstack/react-router";
import { rootRoute } from "../../router";
import { useAuth0 } from "@auth0/auth0-react";
import BaseHeader from "../../components/BaseHeader";

export const userContactsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "contacts",
  component: () => {
    const {
      error: authError,
      user,
      logout,
      isLoading: authLoading,
      isAuthenticated,
    } = useAuth0();

    if ((!isAuthenticated || authError) && !authLoading) {
      return <Navigate to="/" />;
    }

    return (
      <>
        <BaseHeader
          user={{
            avatar: user?.picture,
            isAuthenticated,
          }}
          authOptions={{
            handleLogin: () => {},
            handleLogout: () => {
              logout({
                logoutParams: {
                  returnTo: window.origin,
                },
              });
            },
          }}
        />
        <Outlet />
      </>
    );
  },
});
