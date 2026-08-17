---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/padel/page.tsx","app/kafa/page.tsx","app/dogadjaji/page.tsx","app/rezervacija/page.tsx"]
---

# Scope and visitor mode

Public marketing surfaces for Padel House Beograd, rebuilt as a five-page site: `/` (home), `/padel`, `/kafa`, `/dogadjaji`, and the existing `/rezervacija` booking grid restyled into the same world. `/admin` is out of scope and keeps its current look.

Mode: **Persuade** on the four marketing pages. `/rezervacija` stays **Operate** — the world dresses it, the task never yields to it.

# Audience, job, action

Primary: someone in Belgrade on a phone deciding where to spend a Saturday morning, who may want a court, a coffee, or neither. Action: book a 90-minute court, or reach the café/events without booking anything.

Secondary: club staff (admin, untouched).

Two named failure modes from the user, binding on every decision here:
1. Must not read as a generic booking-SaaS or gym site.
2. Must not become padel-first / venue-second — the real reviews prove people come for the coffee.

# Chosen direction

**Roaster's Panel** — locked on the direction decision page, seed `5a051d80`, candidate 3 of the grounded list. The visual world is specialty-coffee packaging and brew-guide cards: the café's own graphic language applied to the whole venue.

Approved comp: `.impeccable/mocks/decision/assigned.png` (2528×1696, nano_banana_pro, provenance embedded).

**Comp round disclosure:** ran with one option, not three. The approved decision comp is compositional option one; the two variations were not produced because Higgsfield credits were exhausted (1.85 remaining, 4 needed at matching fidelity). Generating them at a cheaper tier was rejected because the fidelity gap would have biased the choice. Not a skipped round — a funded-out one.

Raises carried from declined challengers (each must survive to the build):
- **Exposed Binding** → the slot timetable is the page's ornament, not decorated around.
- **VU Meter Bridge** → availability reads as one sweepable ruler of identical units, never separate cards.
- **CD-ROM Chrome** → a persistent frame carries nav and the booking action across all five pages.
- **ANSI Nightboard** → free slots present as live and scarce, not as a static table.
- **Plankton Wake** → a just-taken slot holds a fading mark.

# Design system read from the approved comp

| Property | What the comp actually does |
|---|---|
| Corner language | **Hard. Zero radius everywhere** — panels, data cells, photo inset. The only curve in the comp is the rubber stamp's oval. |
| Line weights | Single hairline ink rule (~2px at comp scale) forming *outlined* data cells. Boxes are stroked, never filled. |
| Elevation | **None.** Completely flat, no shadows. Depth comes from colour-field adjacency and paper grain only. |
| Colour strategy | **Drenched** — saturated fields own whole regions at page scale. Ground is kraft; fields are green / red / yellow. |
| Type ramp | 1) Display: ultra-wide heavy grotesk caps, full-bleed scale. 2) Panel title: same face, large caps. 3) Data label: small letterspaced caps inside hairline boxes. No serif anywhere. |
| Material | Kraft paper grain; flat ink with slight overprint misregistration (visible as the red offset on the final "L." of PADEL). |
| Imagery stance | Photography as a hard-edged rectangle *inset into* the colour fields, never full-bleed behind text, never rounded. |

Palette: kraft `#D9CDB8`, green `#1A5C3A`, red `#D4472A`, yellow `#E8B830`, ink `#161311`.

# Implementation inventory

| Region | Medium | Note |
|---|---|---|
| Kraft paper ground | **SVG `feTurbulence`** | Deliberate deviation from the raster default: procedural fractal noise is a real texture medium (not a CSS gradient), is resolution-independent, and costs no credits. Flagged for the finish reviewer as the one medium call that departs from the norm. |
| Colour fields | Semantic HTML/CSS | Flat, hard-edged, full-region. |
| Display + panel type | Web font, self-hosted | Wide heavy grotesk with full `latin-ext`. **Not** Fraunces — the old serif is retired with the old world. |
| Hairline data cells | CSS borders | 2px ink, no radius, stroked only. |
| `REZERVIŠI TERMIN` stamp | **Authored SVG** | Signature material on the page's most important element. A flat shape system a session can specify exactly, so vector not raster. Must keep the distressed outline and rotation — reducing it to a bordered pill is the compliance-token version of the design. |
| Overprint misregistration | CSS (offset duplicate text layer) | Countable, exact, non-photographic. |
| Venue photography | **Existing project assets** | `public/photos/*` — real photographs of the actual venue. No generation needed; the world wants hard-edged photo insets, which these serve directly. |
| Availability grid | Semantic HTML + CSS | Carries the Exposed-Binding and VU-Meter raises; must read as one sweepable ruler. |

Density commitment: the top data strip and per-panel data cells are a *system*, not decoration — every page carries a spec strip, and every panel carries a boxed label pair.

# Unresolved

- Display face not yet locked; must carry `latin-ext` (č ć š ž đ) and be genuinely wide/heavy. Locked at build time against a rendered headline, per the TYPE row discipline.
- Screenshot verification is degraded in this harness (automation tab reports `visibilityState: hidden`; images do not composite and IntersectionObserver does not fire). Comp-vs-build overlap comparison may need the user's eyes.
- `/rezervacija` restyle must not alter booking behaviour, the DB-level race protection, or Belgrade wall-clock handling.
