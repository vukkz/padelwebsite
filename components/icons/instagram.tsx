import type { SVGProps } from "react";

/**
 * Instagram glyph.
 *
 * lucide-react dropped brand icons in v1, so this is drawn locally with the
 * same 24×24 grid and 2px stroke as the rest of the icon set — mixing a filled
 * brand SVG in next to stroke icons is the kind of thing that makes a UI look
 * assembled rather than designed.
 */
export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}
