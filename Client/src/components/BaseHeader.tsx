import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import React from "react";

interface BaseHeaderProps {
  user: {
    avatar?: string;
    isAuthenticated?: boolean;
    isGuest?: boolean;
  };
  authOptions?: {
    handleLogin: () => void;
    handleLogout: () => void;
  };
}

const BaseHeader = ({
  user: { avatar, isAuthenticated, isGuest },
  authOptions,
}: BaseHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const resizeListener = () => {
    if (window.matchMedia("(max-width:640px)") && menuOpen) {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", resizeListener);

    return () => {
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  const handleOpenMenu = () => {
    console.log(menuOpen);
    setMenuOpen(!menuOpen);
  };

  return (
    <header>
      <div className="flex justify-between max-w-screen-xl py-5 mx-auto items-center">
        <span className="text-2xl font-medium text-inherit">
          Contact<span className="font-extrabold text-brand">Vault</span>
        </span>
        <div className="flex items-center gap-3 relative">
          <nav
            className={`flex max-sm:flex-col max-sm:absolute max-sm:top-10 max-sm:right-0 items-center max-sm:text-center gap-3 max-sm:bg-slate-200 dark:max-sm:bg-slate-700 max-sm:shadow max-sm:z-50  max-sm:w-max max-sm:rounded-lg ${menuOpen ? "" : "max-sm:hidden"
              }`}
          >
            {isAuthenticated || isGuest ? (
              <>
                <Link
                  to={isGuest ? "/guest" : "/contacts"}
                  className="hover:opacity-90 dark:max-sm:hover:bg-slate-600 max-sm:hover:bg-slate-300 max-sm:py-2 max-sm:w-full "
                >
                  Contacts
                </Link>
                <Link
                  to="/"
                  onClick={() => {
                    authOptions?.handleLogout();
                  }}
                  className="hover:opacity-90 dark:max-sm:hover:bg-slate-600  max-sm:hover:bg-slate-300 max-sm:py-2 4 max-sm:w-full  flex gap-2 items-center justify-center"
                >
                  <span>Logout</span>
                  <div className="w-6 h-6">
                    <img
                      src={avatar || "https://i.stack.imgur.com/l60Hf.png"}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </Link>
              </>
            ) : (
              <div className="flex max-sm:flex-col items-center gap-3">
                {/* Link to auth0 login */}
                <Link
                  onClick={() => {
                    authOptions?.handleLogin();
                  }}
                  className="dark:text-light-shade hover:opacity-90 dark:max-sm:hover:bg-slate-600 max-sm:hover:bg-slate-300 max-sm:py-2 max-sm:px-4 max-sm:w-full font-semibold"
                >
                  Login
                </Link>
                <Link
                  onClick={() => {
                    authOptions?.handleLogin();
                  }}
                  className="dark:text-light-shade dark:max-sm:hover:bg-slate-600 px-7 py-1 font-semibold rounded-md outline-none sm:bg-brand sm:text-light-shade hover:opacity-90 max-sm:hover:bg-slate-300 max-sm:py-2 max-sm:px-4  max-sm:w-full"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 cursor-pointer sm:hidden hover:opacity-80"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            onClick={handleOpenMenu}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default React.memo(BaseHeader);
