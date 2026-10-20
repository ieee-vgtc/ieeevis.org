/**
 * The offer to sign in with the reader's VIS account, next to the Bluesky
 * sign-in: a signed-in attendee can comment and like without a Bluesky account.
 */

import { useId } from "react";
import { hintTextStyle, primaryButtonStyle, signInBoxStyle } from "./styles";

interface VisSignInBoxProps {
  onSignIn: () => void;
}

export default function VisSignInBox({ onSignIn }: VisSignInBoxProps) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} style={signInBoxStyle}>
      {/* Spaced like the Bluesky heading beside it, so the two boxes line up. */}
      <h3 id={headingId} className="font-bold" style={{ margin: "0 0 1rem" }}>
        VIS sign-in
      </h3>
      <p className="mb-0 font-bold">
        Sign in to participate in the discussion.
      </p>
      <p style={hintTextStyle}>
        Comment and like as a VIS attendee, under your name or a pseudonym.
      </p>
      <p>
        <button type="button" style={primaryButtonStyle} onClick={onSignIn}>
          Sign in
        </button>
      </p>
    </section>
  );
}
