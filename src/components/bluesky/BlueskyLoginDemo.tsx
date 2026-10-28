/**
 * Standalone demo wrapper for `BlueskyLogin`: owns the session state and the
 * sign-in handler that `BlueskyDiscussion` otherwise provides.
 */

import BlueskyLogin from "./BlueskyLogin";
import { useBlueskySession } from "./useBlueskySession";

interface BlueskyLoginDemoProps {
  bskyUrl: string;
}

export default function BlueskyLoginDemo({ bskyUrl }: BlueskyLoginDemoProps) {
  const bluesky = useBlueskySession();

  const signInWithBluesky = (input: string) => {
    const { pathname, search, hash } = window.location;
    void bluesky.signIn(input, `${pathname}${search}${hash}`);
  };

  return (
    <BlueskyLogin
      bskyUrl={bskyUrl}
      busy={bluesky.busy}
      error={bluesky.error}
      linkedHandle={null}
      onSignIn={signInWithBluesky}
      onSignOut={() => void bluesky.signOut()}
      session={bluesky.session}
    />
  );
}
