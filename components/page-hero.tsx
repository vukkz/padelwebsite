import Image from "next/image";

/**
 * The opening hero, shared by every public surface.
 *
 * Full-bleed photograph with the type set over it. It exists as one component
 * because four hand-rolled copies drifted immediately: the home page ended up
 * cream-led while the three section pages still opened on photography, so
 * clicking through from the home page read as arriving at a different site.
 *
 * Why the photograph carries the type again, after a pass that moved it onto a
 * cream plate: the plate was a fix for the wrong problem. The complaint was
 * that a dark hero opened onto a cream page as "two sites bolted together" —
 * but the seam was temperature, not darkness. The old scrims were a cold
 * near-black green (#06170f) butted against warm cream. Scrimmed in --shade,
 * the same photograph resolves into the palette instead of fighting it, and
 * the page keeps the one thing a cream plate cannot give it: a photograph at
 * full size, which is what a venue this specific is actually selling.
 *
 * The grade is the point, not decoration. These frames are phone photographs
 * shot in hard midday sun — flat, cold-skied, with a multicolour painted plaza
 * that fights the palette. Saturation down stops the plaza competing, sepia
 * warms the frame into the brand's range, contrast returns the depth, and the
 * multiply wash pulls the surviving hues into one family. The vignette gives
 * each frame a centre. Ungraded, these read as snapshots at any resolution.
 */
export function PageHero({
  label,
  title,
  lead,
  image,
  alt,
  crop = "object-[50%_50%]",
  priority = true,
  tall = false,
  children,
}: {
  label: string;
  title: React.ReactNode;
  lead: string;
  image: string;
  alt: string;
  /**
   * Tailwind object-position classes, written literally at the call site so the
   * scanner sees them — e.g. "object-[50%_60%] lg:object-[50%_26%]".
   *
   * Two values, not one, because every photograph in this project is portrait
   * or square. In a wide desktop hero the container out-aspects the source, so
   * the image fills width and only the Y value does anything; in a phone-tall
   * hero it fills height and only X does. One number cannot serve both.
   */
  crop?: string;
  priority?: boolean;
  /** The home page opens taller than the section pages. */
  tall?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={[
        "relative isolate flex flex-col overflow-hidden bg-shade",
        tall ? "min-h-[92svh]" : "min-h-[76svh]",
      ].join(" ")}
    >
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={[
            // No saturate/sepia. Those two were doing the damage: desaturating
            // and warming every frame toward one hue is what let four different
            // photographs collapse into a single indistinguishable field.
            // Brightness and contrast alone give depth without draining colour.
            "drift object-cover brightness-[0.92] contrast-[1.10]",
            crop,
          ].join(" ")}
        />
        {/* Warm wash: one hue family instead of five competing ones. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#5c3a1c] opacity-20 mix-blend-multiply"
        />
        {/*
          Vignette, so the frame has a centre and the edges recede. Down from
          0.62 and retinted green with the scrims: at full strength it stacked
          with them and turned the frame to murk.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_46%,transparent_28%,rgba(23,18,11,0.25)_100%)]"
        />
      </div>

      {/*
        Scrims in --shade, the warm near-black. Not the brand green.

        This was green for one pass and it was a mistake the token file had
        already called: globals.css:44-52 defines --shade as the scrim colour
        and says, in as many words, "Deliberately NOT the brand green. Layering
        a cold #02301a over golden-hour photography turned the terracotta court
        brown-grey and the warm wood olive." That is exactly what happened —
        with a green scrim over a desaturating filter, four different
        photographs collapsed into one indistinguishable dark-green field, and
        at phone width the venue simply was not visible. The fortress is the
        one asset a competitor cannot copy; it should not be spent on a tint.

        The green idea was right about the palette and wrong about the layer.
        Green still owns whole sections (Proof, the events list, the footer),
        where it is a field rather than a veil. Terracotta still appears once
        per hero, on the button, which is what the dateline going cream bought.

        Bottom-up carries the type; it stops at /86 rather than /95 so the last
        band of the hero still contains photograph instead of going flat — that
        flat band is what turned the hero-to-cream transition into a butt joint.
        Left-to-right holds the text column. The top band exists because the
        header's links sit over open sky on every one of these frames.

        Values are measured, not guessed: the pipeline is replayed offline
        (crop, filter, multiply wash, vignette, scrims) and worst-case pixel
        contrast sampled under the real type boxes at both ends of drift.
        Worst case: home 4.21 headline / 6.35 dateline, /padel 6.17, /kafa 6.63,
        /dogadjaji 4.37 — against floors of 3 and 4.5.
      */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-shade/86 via-shade/55 via-58% to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-shade/78 via-shade/18 via-42% to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-shade/70 to-transparent"
      />

      <div className="mx-auto flex w-full max-w-[88rem] flex-1 flex-col justify-end px-5 pb-14 pt-28 sm:px-8 sm:pb-20 lg:pb-24">
        <h1
          className={[
            "display rise text-cream",
            tall
              ? "max-w-[11ch] text-[3.4rem] sm:text-[5rem] lg:text-[5.5rem] xl:text-[6.5rem]"
              : "max-w-[13ch] text-[3rem] sm:text-[4.2rem] lg:text-[4.6rem] xl:text-[5.4rem]",
          ].join(" ")}
          style={{ animationDelay: "60ms" }}
        >
          {title}
        </h1>

        {/*
          Dateline, under the heading rather than over it. As a kicker above the
          h1 this pre-announced a headline that carries itself, which is the
          single most reliable tell of a generated page; underneath, the same
          words read as attribution.

          Cream, not terracotta. On --shade a light terracotta would in fact
          clear AA comfortably, so this is not a contrast decision — it is the
          palette rule: accent once per screen, on the thing to be clicked.
          Spending terracotta on a dateline puts it on screen twice and takes
          the button's job away from it.
        */}
        <p
          className="label rise mt-6 text-cream/80"
          style={{ animationDelay: "140ms" }}
        >
          {label}
        </p>

        <p
          className="rise mt-6 max-w-[42ch] text-[16px] leading-relaxed text-cream/85"
          style={{ animationDelay: "220ms" }}
        >
          {lead}
        </p>

        {children}
      </div>
    </section>
  );
}
