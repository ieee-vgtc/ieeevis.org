import { useEffect, useRef, useState } from "react";
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

function getLoginHref() {
  const base = siteBase();
  const path = window.location.pathname.startsWith(base)
    ? window.location.pathname.slice(base.length) || "/"
    : window.location.pathname;
  const returnTo = `${path}${window.location.search}`;

  return `${base}/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
}

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${siteBase()}/auth/session`, {
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((session: { user?: SessionUser | null }) => {
        setUser(session.user ?? null);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setUser(null);
        }
      });

    return () => controller.abort();
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

  const initials = user ? getInitials(user) : "";

  return (
    <div
      ref={container}
      className="relative flex flex-none items-center py-3 pr-8 md:h-full md:py-0 md:pr-2 lg:pr-4"
    >
      <button
        ref={trigger}
        type="button"
        className="flex size-11 items-center justify-center rounded-full text-secondary hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary md:text-white md:hover:bg-white/10 md:focus-visible:outline-white"
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
          className="absolute right-4 top-full z-50 w-72 rounded-lg bg-white p-5 text-left text-secondary shadow-lg ring-1 ring-black/5 md:right-2 lg:right-4"
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
                className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-sm font-bold text-white hover:brightness-90"
                href={`${siteBase()}/auth/logout`}
              >
                Sign out
              </a>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold">Sign in</p>
              <p className="mt-1 text-sm text-gray-600">
                Sign in to access attendee features.
              </p>
              <a
                className="mt-4 inline-flex rounded bg-accent px-4 py-2 text-sm font-bold text-white hover:brightness-90"
                href={getLoginHref()}
              >
                Sign in
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
