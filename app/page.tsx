import Link from "next/link";
import Image from "next/image";
import { CLUB, EVENTS, REVIEWS, SLOT_MINUTES } from "@/lib/config";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { PageHero } from "@/components/page-hero";
import { ActionLink } from "@/components/stamp-cta";

/**
 * Home.
 *
 * The club's own campaign, executed as a page: a golden-hour photograph of the
 * court in the fortress moat, their line set large in cream caps over it, and
 * one terracotta action. Everything after it alternates cream and emerald so
 * the scroll has three volumes rather than seven equal announcements.
 */
export default function HomePage() {
	return (
		<>
			{/* Overlaid, not solid: the hero is a full-bleed photograph again, and
			    a cream bar sitting on top of it would read as a separate strip. */}
			<SiteHeader overlay />
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

/*
	The club's own line over the one frame that carries the entire argument at
	once: the bastion and its sentry turret, the rampart wall, the pavilion with
	their sign on it, people sitting at café tables, and the court with a game
	on. Fortress, coffee and padel in a single photograph — which is the whole
	pitch, and the one thing a competitor down the road cannot copy.

	Chosen over the posed three-player frame deliberately. That shot argued the
	opposite of this page: padel first, people first, venue nowhere, with named
	individuals in front of the reader before the place had been sold. It was
	also the one 1440px Instagram export among the good frames. This is 2400x3200
	cut from the sharpest original in the set, and the people in it are incidental
	rather than posed.

	Composition does the layout work too: the bastion is a dark brick mass down
	the left third, exactly where the type sits, so the scrim has less to do
	there than it would over an open frame.
*/
function Hero() {
	return (
		<PageHero
			tall
			label="Kalemegdan · Beograd"
			title="Nije samo padel"
			lead="Teren u šancu Beogradske tvrđave, specialty kafa na terasi i prostor za sve što dolazi posle meča. Rezervacija online — bez poziva i bez čekanja."
			image="/photos/fortress-court.jpg"
			alt="Teren, paviljon i terasa Padel House-a u šancu ispod bedema Beogradske tvrđave"
			/*
				48% holds the band that has the rampart wall, the pavilion and the top
				of the court in it. Higher and the frame is sky; lower and it is all
				court and fence, which is the shot this one replaced.
			*/
			crop="object-[50%_48%]"
		>
			<div className="rise mt-10" style={{ animationDelay: "300ms" }}>
				<ActionLink href="/rezervacija" id="hero-cta">
					Rezerviši termin
				</ActionLink>
			</div>

			<dl
				className="rise mt-12 flex gap-x-10 border-t border-cream/20 pt-8"
				style={{ animationDelay: "360ms" }}
			>
				<Stat k="3" v="terena" />
				<Stat k={`${SLOT_MINUTES}′`} v="po terminu" />
				<Stat k="08–18" v="svakog dana" />
			</dl>
		</PageHero>
	);
}

function Stat({ k, v }: { k: string; v: string }) {
	return (
		<div>
			<dt className="tabular text-[1.6rem] font-semibold leading-none text-cream">
				{k}
			</dt>
			{/* cream/75 over the scrimmed photograph, not ink-faint: the old value
			    measured 3.48:1 even on cream and would be unreadable here. */}
			<dd className="label mt-2 text-cream/75">{v}</dd>
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
						<p className="label text-cream/90">Recenzije</p>
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
						<p className="label mt-5 text-cream/90">{lead.author}</p>

						<ul className="mt-12 grid gap-8 border-t border-cream/25 pt-10 sm:grid-cols-2">
							{rest.map((r) => (
								<li key={r.author} className="flex flex-col">
									<blockquote
										lang={r.lang}
										className="text-[15px] leading-[1.6] text-cream/90"
									>
										“{r.quote}”
									</blockquote>
									<p className="label mt-auto pt-5 text-cream/90">{r.author}</p>
								</li>
							))}
						</ul>

						<div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-3">
							<p className="label text-cream/90">
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
						src="/photos/cinema-night.jpg"
						alt="Projekcija utakmice pred publikom ispod osvetljenog bedema tvrđave"
						fill
						sizes="(max-width: 1024px) 92vw, 58vw"
						/* 38% framed the old wedding photograph; this one carries the
						   screen and the audience below centre. */
						className="object-cover object-[50%_58%]"
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
