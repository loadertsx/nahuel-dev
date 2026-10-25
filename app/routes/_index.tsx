import { Eyebrow } from "~/components/alchemy/ornament";
import { PlateButton } from "~/components/alchemy/plate-button";
import { LazyGateScene } from "~/components/gate-scene/lazy-gate-scene";

import type { Route } from "./+types/_index";

export const handle = { plate: "Plate I · Opus Magnum" };

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "Loadertsx - Software Developer" },
		{
			name: "description",
			content:
				"Software developer crafting thoughtful web experiences. Building products with React, TypeScript, and modern web technologies.",
		},
	];
};

const STEPS = [
	{
		numeral: "I.",
		title: "Comprehension",
		body: "Understand the problem, the people and the constraints before a single line is written.",
		glyph: (
			<>
				<circle cx="20" cy="20" r="15" />
				<circle cx="20" cy="20" r="3" fill="currentColor" />
			</>
		),
	},
	{
		numeral: "II.",
		title: "Deconstruction",
		body: "Break it into simple, honest parts. Keep only what earns its place.",
		glyph: (
			<>
				<path d="M6 10h28L20 34Z" />
				<path d="M11 18h18" />
			</>
		),
	},
	{
		numeral: "III.",
		title: "Reconstruction",
		body: "Rebuild it as a product that feels inevitable — nothing lost, nothing wasted.",
		glyph: (
			<>
				<path d="M20 6l14 24H6Z" />
				<circle cx="20" cy="22" r="3.2" />
			</>
		),
	},
];

export default function Index() {
	return (
		<>
			{/* Hero */}
			<section className="grid xl:grid-cols-[minmax(0,1fr)_auto] items-center gap-10 xl:gap-12 pt-10 md:pt-16 xl:pt-12 pb-16 md:pb-24 xl:pb-24">
				<figure className="order-first xl:order-last flex flex-col items-center gap-3">
					<LazyGateScene className="aspect-square w-full max-w-[340px] md:max-w-[460px] xl:w-[min(540px,60vh)] xl:max-w-none" />
					<figcaption className="italic text-[0.95rem] text-[var(--muted)]">
						Fig. II — Porta Veritatis
					</figcaption>
					<p className="caps text-[0.62rem] tracking-[0.3em] text-[var(--muted)]">
						One is all · All is one
					</p>
				</figure>

				<div className="space-y-7 md:space-y-8">
					<Eyebrow fig="Fig. I" label="Software Developer" />
					<h1 className="font-serif font-light display-hero leading-[0.88] tracking-[-0.02em]">
						Building
						<br />
						products with
						<br />
						<em className="font-light">intention.</em>
					</h1>
					<p className="max-w-[520px] text-[1.125rem] md:text-[1.3rem] leading-[1.5] text-[var(--muted)]">
						I craft web experiences that feel natural and work beautifully —
						currently with React, TypeScript and the modern web platform.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 sm:gap-5 pt-2">
						<PlateButton to="/projects">View my work</PlateButton>
						<PlateButton to="/blog" variant="secondary">
							Read the blog
						</PlateButton>
					</div>
					<p className="font-script text-[1.75rem] text-[var(--muted)]">
						— solve et coagula
					</p>
				</div>
			</section>

			{/* II · The law of equivalent exchange */}
			<section className="space-y-10 md:space-y-14 pb-8">
				<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
					<span className="font-serif font-light text-[4.5rem] md:text-[7rem] leading-[0.8]">
						II
					</span>
					<div className="space-y-2.5">
						<p className="caps text-[0.72rem] text-[var(--muted)]">
							The law of equivalent exchange
						</p>
						<h2 className="font-serif font-medium text-[2rem] md:text-[2.9rem] leading-[1.1] tracking-[-0.01em]">
							To build something, I first take it apart.
						</h2>
					</div>
				</div>
				<ol className="grid xl:grid-cols-3 gap-9 xl:gap-14">
					{STEPS.map((step) => (
						<li
							key={step.title}
							className="flex flex-col md:flex-row xl:flex-col gap-3.5 md:gap-8 xl:gap-4 pt-6 xl:pt-7 border-t border-[var(--ink)]"
						>
							<div className="flex items-center gap-3.5 md:w-[150px] xl:w-auto flex-none">
								<svg
									aria-hidden="true"
									viewBox="0 0 40 40"
									className="size-9"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.2"
								>
									{step.glyph}
								</svg>
								<span className="caps text-[0.8rem]">{step.numeral}</span>
							</div>
							<div className="space-y-2.5">
								<h3 className="font-serif font-medium text-[2rem] md:text-[2.2rem] leading-[1.1]">
									{step.title}
								</h3>
								<p className="text-[1.08rem] md:text-[1.15rem] leading-[1.5] text-[var(--muted)]">
									{step.body}
								</p>
							</div>
						</li>
					))}
				</ol>
			</section>
		</>
	);
}
