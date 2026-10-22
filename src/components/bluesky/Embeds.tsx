/** What a post carries besides its text: attached images, and the single link
 *  card or quoted post a Bluesky post may have. */

import { postUrl } from "./format";
import type { EmbedImage, PostEmbed } from "./types";

/** A grid of thumbnails, each linking to the full-size image. */
export function EmbedImages({ images }: { images: EmbedImage[] }) {
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "0.5rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        marginTop: "0.5rem",
      }}
    >
      {images.map((image, index) => (
        <a
          href={image.fullsize || image.thumb}
          key={`${image.thumb}-${index}`}
          rel="noopener noreferrer"
          style={{ display: "block" }}
          target="_blank"
        >
          <img
            alt={image.alt || ""}
            src={image.thumb || image.fullsize}
            style={{
              width: "100%",
              borderRadius: "0.5rem",
              border: "1px solid var(--color-gray-300)",
            }}
          />
        </a>
      ))}
    </div>
  );
}

const cardStyle = {
  display: "block",
  border: "1px solid var(--color-gray-300)",
  borderRadius: "0.5rem",
  marginTop: "0.5rem",
  overflow: "hidden",
  textDecoration: "none",
  color: "inherit",
} as const;

function isGifUrl(uri: string): boolean {
  try {
    return new URL(uri).pathname.toLowerCase().endsWith(".gif");
  } catch {
    return false;
  }
}

/** Bluesky stores the alt text of a GIF in the link card description, as
 *  "ALT: <text>". The title is the GIF's name, not a description of it. */
function gifAltText(description: string): string {
  const match = /^alt:\s*(.*)$/is.exec(description.trim());
  return match ? match[1].trim() : "";
}

/** The link preview or quote, rendered as one clickable card. */
export function EmbedCard({ embed }: { embed?: PostEmbed | null }) {
  if (!embed) {
    return null;
  }

  // Bluesky posts a GIF as a link card. Show it as the image it is. The thumb
  // is a still frame from Bluesky's CDN, which the page is allowed to load.
  if (embed.kind === "external" && embed.thumb && isGifUrl(embed.uri)) {
    return (
      <a
        href={embed.uri}
        rel="noopener noreferrer"
        style={{ display: "inline-block", marginTop: "0.5rem" }}
        target="_blank"
      >
        <img
          alt={gifAltText(embed.description) || "GIF"}
          src={embed.thumb}
          style={{
            display: "block",
            maxWidth: "100%",
            maxHeight: "300px",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-gray-300)",
          }}
        />
      </a>
    );
  }

  if (embed.kind === "external") {
    return (
      <a
        href={embed.uri}
        rel="noopener noreferrer"
        style={cardStyle}
        target="_blank"
      >
        {embed.thumb && (
          <img
            alt=""
            src={embed.thumb}
            style={{ width: "100%", maxHeight: "180px", objectFit: "cover" }}
          />
        )}
        <div style={{ padding: "0.6rem" }}>
          <strong style={{ display: "block", marginBottom: "0.2rem" }}>
            {embed.title}
          </strong>
          {embed.description && (
            <small style={{ color: "var(--color-gray-600)" }}>
              {embed.description}
            </small>
          )}
        </div>
      </a>
    );
  }

  return (
    <a
      href={postUrl(embed.uri) || "https://bsky.app"}
      rel="noopener noreferrer"
      style={{ ...cardStyle, padding: "0.6rem" }}
      target="_blank"
    >
      <strong style={{ display: "block", marginBottom: "0.2rem" }}>
        Quoted post by @{embed.author}
      </strong>
      <small>{embed.text || "Open the quoted post on Bluesky"}</small>
    </a>
  );
}
