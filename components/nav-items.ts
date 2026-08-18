/**
 * The site's three destinations, in one place.
 *
 * Lives outside site-frame.tsx because the mobile menu is a client component
 * and the frame is not: importing the list from the frame would make the two
 * files import each other.
 *
 * /rezervacija is deliberately absent. The booking plate already points at it
 * and listing it twice would be the frame arguing with itself.
 */
export const NAV = [
  { href: "/padel", label: "Padel" },
  { href: "/kafa", label: "Kafa" },
  { href: "/dogadjaji", label: "Događaji" },
] as const;
