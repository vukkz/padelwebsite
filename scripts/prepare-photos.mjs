/**
 * Normalise the club's photos into web-ready assets.
 *
 *   node scripts/prepare-photos.mjs
 *
 * Source files land in /img straight off a phone or Instagram export — some are
 * 15 MB. This resizes each one to the largest size the layout actually renders,
 * strips EXIF, and writes both AVIF and JPEG into /public/photos.
 *
 * Re-run it whenever new photos are dropped into /img.
 */
import sharp from "sharp";
import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const SRC = "img";
const OUT = "public/photos";

/**
 * Which source file becomes which named slot in the layout.
 * Keys are matched as a substring of the source filename, so the unwieldy
 * Instagram export names don't have to be typed out in full.
 */
const MAP = [
  { match: "AHRPTWmEzRnL", name: "fortress-court", width: 2400, note: "aerial court in the fortress moat — hero" },
  { match: "AHRPTWkKoNvx", name: "pavilion-lawn", width: 1600, note: "café pavilion + lounge chairs on the lawn" },
  // Same source at hero width for /kafa. The 1080px `terrace` frame shows two
  // chairs and nothing else; this one has the pavilion, the terrace seating and
  // the whole lounge lawn under the rampart — the café as a place.
  { match: "AHRPTWkKoNvx", name: "hero-cafe", width: 2268, note: "café pavilion, terrace and lawn — kafa hero" },
  { match: "AHRPTWmZ0czX", name: "court-plaza", width: 1600, note: "court + painted plaza" },
  // Same source as `court-plaza`, at hero width. The original is 4284×5712 —
  // the sharpest frame in the set — so the home hero takes all of it rather
  // than the 1600px card render.
  { match: "AHRPTWmZ0czX", name: "hero-court", width: 3000, note: "court, fence and fortress wall — home hero" },
  { match: "AHRPTWmH0HoD", name: "drinks", width: 1400, note: "drinks tray with rackets" },
  // Same source as `drinks`, kept at full width for the home hero. The 1400px
  // version is sized for a card and goes soft across half a viewport. The
  // source is now an upscaled 3000×4000, so this takes all of it: the hero
  // column runs ~55vw, which is past 2000px of device pixels on a retina
  // laptop, and this is the one image the pitch opens on.
  { match: "AHRPTWmH0HoD", name: "hero-drinks", width: 3000, note: "drinks + rackets, golden hour — home hero" },
  { match: "587409052", name: "rackets-bench", width: 1400, note: "rackets on the bench, golden hour" },
  { match: "589173466", name: "players-three", width: 1600, note: "three players, golden hour" },
  { match: "599530694", name: "player-serve", width: 1600, note: "player serving in front of the pavilion" },
  { match: "607118354", name: "rackets-flatlay", width: 1400, note: "rackets flat-lay on terracotta" },
  { match: "720919597", name: "terrace", width: 1600, note: "café terrace on the painted plaza" },
  { match: "735718511", name: "wedding", width: 1800, note: "wedding dinner on the lawn" },
  { match: "747038345", name: "nije-samo-padel", width: 1400, note: "their own campaign frame" },
  { match: "753205455", name: "cinema-night", width: 1800, note: "screening against the lit fortress wall" },
];

const files = await readdir(SRC);
await mkdir(OUT, { recursive: true });

let done = 0;
for (const entry of MAP) {
  const src = files.find((f) => f.includes(entry.match));
  if (!src) {
    console.log(`  ?  ${entry.name.padEnd(18)} no source matching "${entry.match}"`);
    continue;
  }

  const from = path.join(SRC, src);
  const before = (await stat(from)).size;
  const base = sharp(from).rotate().resize({ width: entry.width, withoutEnlargement: true });

  const jpg = path.join(OUT, `${entry.name}.jpg`);
  await base.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(jpg);

  const avif = path.join(OUT, `${entry.name}.avif`);
  await base.clone().avif({ quality: 55 }).toFile(avif);

  const after = (await stat(jpg)).size;
  const avifSize = (await stat(avif)).size;
  console.log(
    `  ok ${entry.name.padEnd(18)} ${(before / 1024 / 1024).toFixed(1)}MB → ` +
      `${(after / 1024).toFixed(0)}KB jpg / ${(avifSize / 1024).toFixed(0)}KB avif   ${entry.note}`,
  );
  done++;
}

console.log(`\n${done}/${MAP.length} slika obrađeno u ${OUT}\n`);
