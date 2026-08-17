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
            "drift object-cover brightness-[0.92] contrast-[1.14] saturate-[0.75] sepia-[0.3]",
            crop,
          ].join(" ")}
        />
        {/* Warm wash: one hue family instead of five competing ones. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#5c3a1c] opacity-25 mix-blend-multiply"
        />
        {/*
          Vignette, so the frame has a centre and the edges recede. Down from
          0.62 to 0.25: at full strength it stacked with the scrims below and
          the three together turned a golden-hour frame into brown murk.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_46%,transparent_28%,rgba(23,18,11,0.25)_100%)]"
        />
      </div>

      {/*
        Scrims, all --shade rather than the old cold green.

        Bottom-up carries the type block. Left-to-right takes the edge off the
        text column. The top band exists because the header's links sit over
        open sky on every one of these frames and measured ~1.4:1 unscrimmed.

        These values were measured, not guessed, by replaying the whole pipeline
        offline — crop, the CSS filter chain, the multiply wash, vignette, every
        scrim — and sampling worst-case pixel contrast under the real type boxes
        at both ends of the drift animation. Two things came out of that:

        1. The first pass (opaque bottom, 0.80 left edge, 0.62 vignette) was
           roughly 2x past what AA needs and stacked into brown murk, erasing
           the left-hand figure — the whole reason that photograph was chosen.
        2. The short heroes need a different ramp, not the same one. Their type
           sits higher in a 76svh frame than it does in a 92svh one, above where
           a bottom-up gradient has any strength left; /padel's dateline came
           out at 2.68:1 and /dogadjaji's headline at 2.68:1 on the tall values.
           Hence the flat veil and the taller ramp below.

        Worst case now, across both drift keyframes: home 5.53 on the dateline
        (the binding one) and 5.93 on the headline; /padel 4.91, /kafa 6.79,
        /dogadjaji 5.42. The dateline is always the first thing to fail — it is
        11px caps, so it answers to 4.5:1, not the headline's 3:1.
      */}
      {tall ? null : (
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-shade/10" />
      )}
      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-10 bg-gradient-to-t",
          tall
            ? "from-shade/92 via-shade/60 via-56% to-transparent"
            : "from-shade/94 via-shade/66 via-70% to-shade/20",
        ].join(" ")}
      />
      <div
        aria-hidden="true"
        className={[
          "absolute inset-0 -z-10 bg-gradient-to-r",
          tall
            ? "from-shade/30 via-shade/5 via-28% to-transparent"
            : "from-shade/35 via-shade/8 via-30% to-shade/2",
        ].join(" ")}
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
          words read as attribution. Terracotta-light, not terracotta: the base
          accent measures ~3.0:1 on --shade and fails AA outright.
        */}
        <p
          className="label rise mt-6 text-terracotta-light"
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
