/** What a post carries besides its text: attached images, and the single link
 *  card or quoted post a Bluesky post may have. */

import { postUrl } from "./format";
import type { EmbedImage, PostEmbed } from "./types";

// Tall enough to make out an image, short enough to keep the thread readable.
const IMAGE_MAX_HEIGHT = "300px";
const GRID_THUMB_MAX_WIDTH = "180px";

const imageFrameStyle = {
  borderRadius: "0.5rem",
  border: "1px solid var(--color-gray-300)",
} as const;

/** One image shown whole, at most `IMAGE_MAX_HEIGHT` tall. */
const singleImageStyle = {
  ...imageFrameStyle,
  display: "block",
  maxWidth: "100%",
  maxHeight: IMAGE_MAX_HEIGHT,
} as const;

/**
 * The attached images, each linking to its full size. A single image keeps its
 * shape; several become a row of square thumbnails.
 */
export function EmbedImages({ images }: { images: EmbedImage[] }) {
  if (!images || images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    const [image] = images;
    return (
      <a
        href={image.fullsize || image.thumb}
        rel="noopener noreferrer"
        style={{ display: "inline-block", marginTop: "0.5rem" }}
        target="_blank"
      >
        <img
          alt={image.alt || ""}
          src={image.thumb || image.fullsize}
          style={singleImageStyle}
        />
      </a>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "0.5rem",
        gridTemplateColumns: `repeat(auto-fill, minmax(120px, ${GRID_THUMB_MAX_WIDTH}))`,
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
              ...imageFrameStyle,
              display: "block",
              width: "100%",
              aspectRatio: "1",
              objectFit: "cover",
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
          style={singleImageStyle}
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
