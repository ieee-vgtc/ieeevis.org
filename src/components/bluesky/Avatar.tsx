/** A post author's picture. Decorative: the name beside it is the label, so
 *  the alt text stays empty and a missing picture renders nothing at all. */

export default function Avatar({
  src,
  size,
}: {
  src: string | null;
  size: number;
}) {
  if (!src) {
    return null;
  }

  return (
    <img
      alt=""
      src={src}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "9999px",
        objectFit: "cover",
        border: "1px solid #e5e7eb",
        flexShrink: 0,
      }}
    />
  );
}
