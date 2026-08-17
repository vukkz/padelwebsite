import Link from "next/link";
import Image from "next/image";
import { CLUB, EVENTS, REVIEWS, SLOT_MINUTES } from "@/lib/config";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { ActionLink } from "@/components/stamp-cta";

/**
 * Home.
 *
 * The club's own campaign, executed as a page: a sunlit photograph of the court
 * in the fortress moat, their line set large in cream caps over it, and one
 * terracotta action. Everything after it alternates cream and emerald so the
 * scroll has three volumes rather than seven equal announcements.
 */
export default function HomePage() {
	return (
		<>
			{/* Solid, not overlaid: the hero's left panel is cream now, and cream
			    chrome on a cream plate is invisible. */}
			<SiteHeader />
			<main className="flex-1">
				<Hero />
				<Trio />
				<Proof />
				<Events />
				<Closing />
			</main>
			<SiteFooter />
		</>
	);
}

/* ----------------------------------------------------------------- hero -- */

function Hero() {
	return (
		<section className="relative isolate grid min-h-[92svh] grid-cols-1 bg-cream lg:grid-cols-12">
			{/*
        The venue itself, from the sharpest original in the set (4284×5712).

        Two frames were tried and rejected here. The posed three-player shot put
        faces in front of the headline and only exists as a 1440px Instagram
        export. The drinks tray was sharp but framed so close that the rackets
        and balls stopped reading — it does its job at card scale on /kafa,
        where the detail is the point.

        This one shows the thing being sold: the court, the glass, the branded
        posts and the fortress wall behind them, with no one in it to compete
        with the type. Graded down — the raw frame is hard midday sun, and
        pulling brightness while lifting contrast turns that into depth rather
        than glare.
      */}
			<div className="relative order-1 min-h-[46svh] overflow-hidden bg-shade lg:order-2 lg:col-span-6 lg:min-h-0 xl:col-span-7">
				{/*
          Graded, not just placed.

          The source is the sharpest frame in the set, but resolution and
          quality are different things: shot in hard midday sun it arrives flat,
          with a cold blue sky, cool shadows and a multicolour painted plaza
          that all fight the cream-and-terracotta palette. Ungraded it reads as
          a snapshot at any pixel count.

          Three layers do the work. The filter pulls saturation down so the
          plaza's blues and teals stop competing, warms the whole frame toward
          the brand's range, and lifts contrast for depth. The multiply wash
          unifies the remaining hues into one warm family. The vignette settles
          the edges so the eye lands on the court rather than the fence.

          Crop moved left to 38% as well: at 55% the mesh fence and the vertical
          banner owned the right third of the frame, spending the hero on the
          barrier rather than the venue.
        */}
				<Image
					src="/photos/hero-court.jpg"
					alt="Teren, staklena ograda i bedem tvrđave u šancu Kalemegdana"
					fill
					priority
					sizes="(max-width: 1024px) 100vw, 55vw"
					className="drift object-cover object-[38%_55%] brightness-[0.92] contrast-[1.14] saturate-[0.75] sepia-[0.3]"
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
				{/* No navigation scrim here any more — the header is solid and sits
				    above the grid rather than over the photograph. */}
			</div>

			{/*
				Cream panel, not near-black.

				As a dark plate this opened onto a page that is cream, emerald and
				bright — two different sites bolted together at the fold. The rest of
				the site is the brand; the hero was the outlier, so the hero moved.
				The graded photograph now supplies all the darkness the screen needs,
				and it reads richer against cream than it did against black.
			*/}
			<div className="order-2 flex flex-col justify-end px-5 pb-14 pt-14 sm:px-8 sm:pb-20 lg:order-1 lg:col-span-6 lg:pb-24 lg:pl-[max(2rem,calc((100vw-88rem)/2+2rem))] lg:pt-24 xl:col-span-5">
				<p
					className="label rise text-terracotta"
					style={{ animationDelay: "60ms" }}
				>
					Kalemegdan · Beograd
				</p>

				<h1
					className="display rise mt-7 max-w-[11ch] text-ink text-[3.4rem] sm:text-[5rem] lg:text-[5.5rem] xl:text-[6.5rem]"
					style={{ animationDelay: "140ms" }}
				>
					Nije samo padel
				</h1>

				<p
					className="rise mt-8 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft"
					style={{ animationDelay: "220ms" }}
				>
					Teren u šancu Beogradske tvrđave, specialty kafa na terasi i prostor
					za sve što dolazi posle meča. Rezervacija online — bez poziva i bez
					čekanja.
				</p>

				<div className="rise mt-10" style={{ animationDelay: "300ms" }}>
					<ActionLink href="/rezervacija" id="hero-cta">
						Rezerviši termin
					</ActionLink>
				</div>

				<dl
					className="rise mt-12 flex gap-x-10 border-t border-rule pt-8"
					style={{ animationDelay: "360ms" }}
				>
					<Stat k="3" v="terena" />
					<Stat k={`${SLOT_MINUTES}′`} v="po terminu" />
					<Stat k="08–18" v="svakog dana" />
				</dl>
			</div>
		</section>
	);
}

function Stat({ k, v }: { k: string; v: string }) {
	return (
		<div>
			<dt className="tabular text-[1.6rem] font-semibold leading-none text-ink">
				{k}
			</dt>
			<dd className="label mt-2 text-ink-faint">{v}</dd>
		</div>
	);
}

/* ------------------------------------------------------------------ trio -- */

/** The three things this venue is. Padel is one of them, not the subject. */
function Trio() {
	const items = [
		{
			href: "/padel",
			title: "Padel",
			text: "Tri terena sa reflektorima, termini od 90 minuta. Reketi i loptice se iznajmljuju na licu mesta.",
			img: "/photos/player-serve.jpg",
			alt: "Igračica servira na terakota terenu ispred paviljona",
		},
		{
			href: "/kafa",
			title: "Kafa",
			text: "Specialty kafa i kroasani na terasi između terena i bedema. Niko ne mora da igra da bi seo.",
			img: "/photos/terrace.jpg",
			alt: "Terasa kafea sa stolovima na oslikanom platou",
		},
		{
			href: "/dogadjaji",
			title: "Događaji",
			text: "Venčanja, firmske proslave i projekcije ispod osvetljenog bedema tvrđave.",
			img: "/photos/cinema-night.jpg",
			alt: "Projekcija utakmice uz osvetljeni bedem tvrđave",
		},
	];

	return (
		<section className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-32">
			{/* Three columns on one line. The images share an aspect ratio and the
          links are pushed to a common baseline with mt-auto, so the row reads
          as one band rather than three loose cards. */}
			<div className="grid gap-12 md:grid-cols-3 md:gap-8">
				{items.map((it) => (
					<Link
						key={it.href}
						href={it.href}
						className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-8 focus-visible:ring-offset-cream"
					>
						<div className="relative aspect-[4/5] overflow-hidden bg-cream-warm">
							<Image
								src={it.img}
								alt={it.alt}
								fill
								sizes="(max-width: 768px) 92vw, 30vw"
								className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
							/>
						</div>
						<h2 className="display mt-7 text-[1.9rem] text-ink sm:text-[2.2rem]">
							{it.title}
						</h2>
						<p className="mt-3 max-w-[36ch] text-[15px] leading-relaxed text-ink-soft">
							{it.text}
						</p>
						{/* mt-auto: the copy runs two lines in one card and three in
                another, which was stepping the three links out of line. */}
						<span className="label mt-auto inline-flex items-center gap-2 pt-5 text-terracotta">
							Pogledaj
							<span
								aria-hidden="true"
								className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
							>
								→
							</span>
						</span>
					</Link>
				))}
			</div>
		</section>
	);
}

/* ---------------------------------------------------------------- proof -- */

/**
 * The strongest argument the club has, and the one the old site buried: every
 * real review praises the coffee and the setting, never the padel.
 */
function Proof() {
	const lead = REVIEWS[0];
	const rest = REVIEWS.slice(1, 3);

	return (
		<section className="bg-green text-cream">
			<div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-32">
				<div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
					{/*
            A photograph carries this block now. As three columns of quotes on
            flat emerald it was two colours and nothing to look at — the reason
            it read as basic was that there was no image and no scale contrast,
            not that the quotes were wrong.
          */}
					<div className="relative aspect-[4/5] lg:col-span-5">
						<Image
							src="/photos/drinks.jpg"
							alt="Kafa i piće na stolu na terasi kluba"
							fill
							sizes="(max-width: 1024px) 92vw, 40vw"
							className="object-cover"
						/>
					</div>

					<div className="flex flex-col lg:col-span-7">
						<p className="label text-cream/75">Recenzije</p>
						<h2 className="display mt-6 max-w-[13ch] text-[2.8rem] sm:text-[4.5rem]">
							Ostaju zbog kafe
						</h2>

						{/*
              One quote set large as the argument, two beneath it as
              corroboration. Equal-weight columns gave the section no focal
              point, so nothing in it was worth reading first.

              lang is not decoration: the document is sr-Latn-RS and these are
              English, so without it a Serbian screen reader speaks them with
              Serbian phonemes (WCAG 3.1.2).
            */}
						<blockquote
							lang={lead.lang}
							className="mt-10 max-w-[34ch] text-[1.4rem] leading-[1.45] text-cream sm:text-[1.75rem]"
						>
							“{lead.quote}”
						</blockquote>
						<p className="label mt-5 text-cream/75">{lead.author}</p>

						<ul className="mt-12 grid gap-8 border-t border-cream/25 pt-10 sm:grid-cols-2">
							{rest.map((r) => (
								<li key={r.author} className="flex flex-col">
									<blockquote
										lang={r.lang}
										className="text-[15px] leading-[1.6] text-cream/90"
									>
										“{r.quote}”
									</blockquote>
									<p className="label mt-auto pt-5 text-cream/75">{r.author}</p>
								</li>
							))}
						</ul>

						<div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-3">
							<p className="label text-cream/75">
								{CLUB.rating.score} · {CLUB.rating.count} recenzija ·{" "}
								{CLUB.rating.source}
							</p>
							<Link
								href="/kafa"
								className="label inline-flex min-h-11 items-center gap-2 text-cream underline decoration-cream/40 underline-offset-[8px] transition-colors hover:decoration-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
							>
								Sve recenzije →
							</Link>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

/* --------------------------------------------------------------- events -- */

function Events() {
	return (
		<section className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8 sm:py-32">
			<div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
				<div className="lg:col-span-5">
					<p className="label text-terracotta">Događaji</p>
					<h2 className="display mt-6 max-w-[12ch] text-[2.6rem] text-ink sm:text-[3.6rem]">
						Tvrđava kao sala
					</h2>
					<p className="mt-7 max-w-[42ch] text-[16px] leading-relaxed text-ink-soft">
						Zatvaramo ceo prostor za vas: travnjak ispod bedema, terasu i teren.
						Organizaciju radimo od početka do kraja.
					</p>

					{/*
            Three things the club has actually put on, named. The list this
            replaced was "Venčanja · Firmske proslave · Rođendani · Turniri",
            which is true of every venue in the city and read as keyword filler.
          */}
					<ul className="mt-10 border-t border-rule">
						{EVENTS.slice(0, 3).map((e) => (
							<li
								key={e.name}
								className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-rule py-5"
							>
								<span className="text-[1.05rem] font-semibold text-ink">
									{e.name}
								</span>
								<span className="label text-ink-faint">{e.meta}</span>
							</li>
						))}
					</ul>

					<ActionLink href="/dogadjaji" className="mt-10">
						Pogledaj događaje
					</ActionLink>
				</div>

				<div className="relative aspect-[5/4] lg:col-span-7">
					<Image
						src="/photos/wedding.jpg"
						alt="Svadbena večera na travnjaku ispod bedema tvrđave"
						fill
						sizes="(max-width: 1024px) 92vw, 58vw"
						className="object-cover object-[50%_38%]"
					/>
				</div>
			</div>
		</section>
	);
}

/* -------------------------------------------------------------- closing -- */

function Closing() {
	return (
		<section className="relative isolate overflow-hidden bg-shade">
			{/* The wide moat frame closes the page instead of opening it: as an
          establishing shot it says where this is, which is the right job for a
          closing section and the wrong one for a hero. */}
			<div className="absolute inset-0 overflow-hidden">
				<Image
					src="/photos/fortress-court.jpg"
					alt=""
					fill
					sizes="100vw"
					className="object-cover object-[62%_center]"
				/>
			</div>
			<div
				aria-hidden="true"
				className="absolute inset-0 bg-gradient-to-r from-shade via-shade/85 via-45% to-shade/40"
			/>

			<div className="relative mx-auto max-w-[88rem] px-5 py-24 sm:px-8 sm:py-36">
				<h2 className="display max-w-[13ch] text-cream text-[2.8rem] sm:text-[4.5rem]">
					Vidimo se na terenu
				</h2>
				<p className="mt-6 max-w-[38ch] text-[16px] leading-relaxed text-cream/80">
					Izaberi dan i termin — potvrdu dobijaš odmah na ekranu, bez čekanja.
				</p>
				<div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
					<ActionLink href="/rezervacija" tone="cream">
						Rezerviši termin
					</ActionLink>
					<a
						href={CLUB.phoneHref}
						className="label inline-flex min-h-11 items-center text-cream/75 underline decoration-cream/30 underline-offset-[8px] transition-colors hover:text-cream hover:decoration-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream/40"
					>
						{CLUB.phone}
					</a>
				</div>
			</div>
		</section>
	);
}
