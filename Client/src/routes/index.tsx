import { useAuth0 } from "@auth0/auth0-react";
import { Route } from "@tanstack/react-router";
import { useEffect } from "react";
import { guestService, userService } from "../api/backend";
import BaseHeader from "../components/BaseHeader";
import router, { rootRoute } from "../router";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => {
    const {
      loginWithRedirect,
      isAuthenticated,
      user,
      logout,
      getAccessTokenSilently,
    } = useAuth0();

    useEffect(() => {
      if (user?.sub && isAuthenticated) {
        // Send a request to the server to add the authenticated user to the database if they are already not added
        getAccessTokenSilently({}).then((token) => {
          userService.get(token).catch(() => {
            console.error("Failed to get user from server");
          });
        });

        // Navigate to user contacts when authenticated
        router.navigate({
          from: "/",
          to: "contacts",
        });
      }
    }, [user]);

    const handleGuestLogin = async () => {
      router.navigate({
        from: "/",
        to: "/guest",
      });
    };

    return (
      <>
        <BaseHeader
          user={{
            isAuthenticated,
          }}
          authOptions={{
            handleLogin: () => {
              loginWithRedirect();
            },
            handleLogout: () => {
              logout({
                logoutParams: {
                  returnTo: window.origin,
                },
              });
            },
          }}
        />
        <main className="mt-36 font-inter">
          <div className="text-center">
            <h1 className="p-3 mb-4 text-3xl sm:text-5xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-l from-violet-500 to-brand">
              Contact Management Simplified
            </h1>

            <p className="md:text-xl font-light text-lighter-shade">
              The All-In-One contact management system <br />
              that revolutionizes the way you store, manage, and connect with
              your
              <br />
              contacts and social media accounts
            </p>

            <div className="flex justify-center sm:gap-16 gap-7 mt-10">
              <button
                className="px-7 py-1 font-semibold rounded-md outline-none text-light-shade bg-brand hover:bg-brand max-sm:text-sm"
                onClick={() => {
                  loginWithRedirect();
                }}
              >
                Get Started
              </button>
              <button
                className="px-7 py-1 font-semibold bg-transparent border-2 rounded-md outline-none text-violet-600 dark:text-violet-400 dark:border-violet-400 border-violet-600 max-sm:text-sm"
                onClick={handleGuestLogin}
              >
                Login as guest
              </button>
            </div>
          </div>
        </main>
      </>
    );
  },
});
