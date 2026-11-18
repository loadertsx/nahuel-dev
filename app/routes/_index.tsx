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
			<section className="home-hero grid items-center gap-9 py-12 sm:py-16 lg:grid-cols-2 lg:gap-8 xl:gap-12">
				<div className="space-y-6">
					<p className="home-role caps text-xs">Software Developer</p>
					<h1 className="display-hero font-serif font-medium leading-[0.91] tracking-[-0.045em]">
						Building products with{" "}
						<em className="font-medium text-[var(--stone)]">intention.</em>
					</h1>
					<p className="max-w-[38ch] text-xl leading-relaxed text-[var(--muted)] md:text-2xl">
						I craft web experiences that feel natural and work beautifully —
						currently with React, TypeScript and the modern web platform.
					</p>
					<div className="flex flex-wrap gap-3.5 pt-2 sm:gap-5">
						<PlateButton to="/projects">View my work</PlateButton>
						<PlateButton to="/blog" variant="secondary">
							Read the blog
						</PlateButton>
					</div>
				</div>

				<figure className="gate-plate">
					<div className="gate-plate-stage">
						<LazyGateScene className="relative aspect-square w-full max-w-[485px] text-[var(--ink)]" />
					</div>
					<figcaption className="gate-plate-caption">
						<span className="italic text-lg">Porta Veritatis</span>
						<span className="caps text-[0.65rem] text-[var(--muted)]">
							One is all · All is one
						</span>
					</figcaption>
				</figure>
			</section>

			<section className="home-process space-y-7 pb-8 pt-10 md:space-y-10 md:pt-14">
				<div className="space-y-3">
					<p className="caps text-xs text-[var(--stone)]">
						The law of equivalent exchange
					</p>
					<h2 className="font-serif font-medium text-[2rem] md:text-[2.9rem] leading-[1.1] tracking-[-0.02em]">
						To build something, I first take it apart.
					</h2>
				</div>
				<ol className="grid gap-3 md:grid-cols-3 md:gap-4">
					{STEPS.map((step) => (
						<li
							key={step.title}
							className="process-step flex flex-col gap-4 p-5 xl:p-7"
						>
							<div className="flex items-center justify-between gap-3.5 text-[var(--stone)]">
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
								<h3 className="font-serif font-medium text-[1.7rem] xl:text-[2.1rem] leading-[1.1]">
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
