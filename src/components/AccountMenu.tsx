import { useEffect, useRef, useState } from "react";
import {
  currentPagePath,
  getCurrentUser,
  login,
  logout,
} from "../lib/auth0Client";
import { siteBase } from "../utils/withBaseURL";

type SessionUser = {
  email?: string;
  name?: string;
};

function getInitials(user: SessionUser) {
  const names = user.name?.trim().split(/\s+/).filter(Boolean) ?? [];

  if (names.length > 1) {
    return `${names[0][0]}${names.at(-1)?.[0]}`.toUpperCase();
  }

  const fallback = names[0] || user.email?.split("@")[0] || "";
  return fallback.slice(0, 2).toUpperCase();
}

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let cancelled = false;

    getCurrentUser().then((currentUser) => {
      if (!cancelled) {
        setUser(currentUser);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isOpen]);

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    window.requestAnimationFrame(() => trigger.current?.focus());
  };

  const handleSignIn = () => {
    login(currentPagePath()).catch((error: unknown) => {
      console.error("Unable to start Auth0 login:", error);
    });
  };

  const handleSignOut = () => {
    logout().catch((error: unknown) => {
      console.error("Unable to start Auth0 logout:", error);
    });
  };

  const initials = user ? getInitials(user) : "";

  return (
    <div
      ref={container}
      className="relative flex w-full flex-none items-center px-8 pt-4 md:order-11 md:h-full md:w-auto md:p-0 md:pr-2 lg:pr-4"
    >
      <div className="flex w-full items-center gap-2 md:hidden">
        {user ? (
          <>
            <span
              className="flex size-9 flex-none items-center justify-center text-sm font-bold tracking-wide text-secondary"
              aria-label={user.name || user.email || "Signed-in user"}
            >
              {initials}
            </span>
            <a
              href={`${siteBase()}/account/`}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-primary-200 bg-white px-4 font-display text-sm font-bold text-secondary hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              aria-label={`Profile (${user.name || user.email || "signed-in user"})`}
            >
              Profile
            </a>
            <button
              type="button"
              className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-primary-200 bg-white px-4 font-display text-sm font-bold text-secondary hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </>
        ) : user === null ? (
          <button
            type="button"
            className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-primary-200 bg-white px-4 font-display text-sm font-bold text-secondary hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            onClick={handleSignIn}
          >
            Sign in
          </button>
        ) : null}
      </div>

      <button
        ref={trigger}
        type="button"
        className="hidden size-11 items-center justify-center rounded-full text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:flex"
        aria-label={
          user
            ? `Open account menu for ${user.name || user.email}`
            : "Open sign-in menu"
        }
        aria-expanded={isOpen}
        aria-controls="account-panel"
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            closeAndRestoreFocus();
          }
        }}
      >
        {initials ? (
          <span
            className="flex size-9 items-center justify-center rounded-full border border-current text-sm font-bold tracking-wide"
            aria-hidden="true"
          >
            {initials}
          </span>
        ) : (
          <i className="material-icons" aria-hidden="true">
            person
          </i>
        )}
      </button>

      {isOpen && (
        <div
          id="account-panel"
          role="dialog"
          aria-label="Account"
          className="absolute right-2 top-full z-50 hidden w-72 rounded-lg bg-white p-5 text-left text-secondary shadow-lg ring-1 ring-black/5 md:block lg:right-4"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeAndRestoreFocus();
            }
          }}
        >
          {user === undefined ? (
            <p className="text-sm text-gray-600" aria-live="polite">
              Checking sign-in status…
            </p>
          ) : user ? (
            <>
              <p className="font-display text-lg font-bold">
                {user.name || "Your account"}
              </p>
              {user.email && (
                <p className="mt-1 truncate text-sm text-gray-600">
                  {user.email}
                </p>
              )}
              <a
                href={`${siteBase()}/account/`}
                className="mt-4 mr-3 inline-flex py-2 text-sm font-bold underline"
              >
                Your profile
              </a>
              <button
                type="button"
                className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-sm font-bold text-white hover:brightness-90"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold">Sign in</p>
              <p className="mt-1 text-sm text-gray-600">
                Sign in to access attendee features.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-sm font-bold text-white hover:brightness-90"
                onClick={handleSignIn}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
