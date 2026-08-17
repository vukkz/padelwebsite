import Image from "next/image";

/**
 * The split hero, shared by every public surface.
 *
 * Cream plate carrying the type, graded photograph beside it. It exists as one
 * component because four hand-rolled copies drifted immediately: the home page
 * ended up cream-led while the three section pages still opened on full-bleed
 * dark photography, so clicking through from the home page read as arriving at
 * a different site.
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
  objectPosition = "50% 50%",
  priority = true,
  tall = false,
  children,
}: {
  label: string;
  title: React.ReactNode;
  lead: string;
  image: string;
  alt: string;
  /** Tailwind arbitrary value, e.g. "38% 55%". */
  objectPosition?: string;
  priority?: boolean;
  /** The home page opens taller than the section pages. */
  tall?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section
      className={[
        "relative isolate grid grid-cols-1 bg-cream lg:grid-cols-12",
        tall ? "min-h-[92svh]" : "min-h-[76svh]",
      ].join(" ")}
    >
      <div className="relative order-1 min-h-[42svh] overflow-hidden bg-shade lg:order-2 lg:col-span-6 lg:min-h-0 xl:col-span-7">
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 55vw"
          className="drift object-cover brightness-[0.92] contrast-[1.14] saturate-[0.75] sepia-[0.3]"
          style={{ objectPosition }}
        />
        {/* Warm wash: one hue family instead of five competing ones. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#5c3a1c] opacity-25 mix-blend-multiply"
        />
        {/* Vignette, so the frame has a centre and the edges recede. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_48%_46%,transparent_28%,rgba(23,18,11,0.62)_100%)]"
        />
      </div>

      <div className="order-2 flex flex-col justify-end px-5 pb-14 pt-14 sm:px-8 sm:pb-20 lg:order-1 lg:col-span-6 lg:pb-24 lg:pl-[max(2rem,calc((100vw-88rem)/2+2rem))] lg:pt-24 xl:col-span-5">
        <p className="label rise text-terracotta" style={{ animationDelay: "60ms" }}>
          {label}
        </p>

        <h1
          className={[
            "display rise mt-7 text-ink",
            tall
              ? "max-w-[11ch] text-[3.4rem] sm:text-[5rem] lg:text-[5.5rem] xl:text-[6.5rem]"
              : "max-w-[13ch] text-[3rem] sm:text-[4.2rem] lg:text-[4.6rem] xl:text-[5.4rem]",
          ].join(" ")}
          style={{ animationDelay: "140ms" }}
        >
          {title}
        </h1>

        <p
          className="rise mt-8 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft"
          style={{ animationDelay: "220ms" }}
        >
          {lead}
        </p>

        {children}
      </div>
    </section>
  );
}
