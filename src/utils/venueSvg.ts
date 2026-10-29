/**
 * Prepares a floor-plan SVG (exported from Illustrator) for inlining on the
 * venue page. Inputs are the static files in src/assets/venue/, never user
 * content.
 *
 * Layers, top to bottom, are groups named `highlight`, `annotations`, `rooms`
 * and `floorplan`. Room shapes are `room-<shape>` and their outlines in the
 * highlight layer are `hl-<shape>`; Illustrator writes layer and object names
 * as ids, and may append `_2`-style suffixes or use underscores for spaces.
 */

const LAYERS = ["highlight", "annotations", "rooms", "floorplan"];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/_\d+_?$/, "")
    .replace(/[_\s]+/g, "-")
    .replace(/-+$/, "");

export function prepareFloorSvg(
  raw: string,
  floor: string,
  label: string,
): string {
  const prefix = `l${floor}-`;
  return (
    raw
      .replace(/<\?xml[\s\S]*?\?>/, "")
      .replace(/<!--[\s\S]*?-->/g, "")
      // Illustrator's style classes (.st0, .cls-1) mean different things in
      // each file, and inline SVG styles apply to the whole page.
      .replace(/\.(st\d+|cls-\d+)\b/g, `.${prefix}$1`)
      .replace(
        /\sclass="([^"]+)"/g,
        (_, names: string) =>
          ` class="${names.replace(/\b(st\d+|cls-\d+)\b/g, `${prefix}$1`)}"`,
      )
      .replace(/(\s)id="([^"]+)"/g, (_, space: string, id: string) => {
        const name = slug(id);
        const layer = LAYERS.find((l) => name === l);
        const room = /^room-(.+)$/.exec(name);
        const hl = /^hl-(.+)$/.exec(name);
        const marker = /^marker-(.+)$/.exec(name);
        const data = layer
          ? ` data-layer="${layer}"`
          : room
            ? ` data-room="${room[1]}"`
            : hl
              ? ` data-hl="${hl[1]}"`
              : marker
                ? ` data-marker="${marker[1]}"`
                : "";
        return `${space}id="${prefix}${id}"${data}`;
      })
      .replace(/url\(#/g, `url(#${prefix}`)
      .replace(/href="#/g, `href="#${prefix}`)
      .replace(
        /<svg\b([^>]*)>/,
        (_, attrs: string) =>
          `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")} class="floor-svg" role="img" aria-label="${label} plan">`,
      )
  );
}
