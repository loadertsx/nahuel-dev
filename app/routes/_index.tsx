import { PlateButton } from "~/components/alchemy/plate-button";
import { SigilLink } from "~/components/alchemy/sigil-link";
import { GateExhibit } from "~/components/gate-scene/gate-exhibit";
import { projects } from "~/content/projects";
import type { Route } from "./+types/_index";
import CardProject from "./projects/components/card-project";

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
			<section className="home-hero">
				<div className="home-hero-copy">
					<p className="home-role caps text-xs">Loader · Software Developer</p>
					<h1 className="display-hero font-serif font-medium">
						Building for <em>the web.</em>
					</h1>
					<p className="max-w-[36ch] text-xl leading-relaxed md:text-2xl">
						I build thoughtful software with React and TypeScript, and write
						about what I learn along the way.
					</p>
					<div className="flex flex-wrap items-center gap-5 pt-1">
						<PlateButton to="/projects">View my work</PlateButton>
						<SigilLink to="/blog">Read the blog</SigilLink>
					</div>
				</div>
				<GateExhibit />
			</section>

			<section aria-labelledby="selected-work" className="home-section">
				<header className="home-section-heading">
					<div className="space-y-2">
						<p className="caps text-xs text-[var(--stone)]">Selected Work</p>
						<h2 id="selected-work" className="home-section-title">
							Transmutations.
						</h2>
					</div>
					<SigilLink to="/projects">All projects</SigilLink>
				</header>
				<div className="grid gap-4 md:grid-cols-3">
					{projects.slice(0, 3).map((project, index) => (
						<CardProject
							key={project.title}
							{...project}
							index={index}
							illustrated
						/>
					))}
				</div>
			</section>

			<section
				aria-labelledby="equivalent-exchange"
				className="home-section home-process"
			>
				<div className="space-y-3">
					<p className="caps text-xs text-[var(--stone)]">
						The law of equivalent exchange
					</p>
					<h2 id="equivalent-exchange" className="home-section-title">
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

			<section aria-labelledby="correspondence" className="home-contact">
				<img
					src="/me.png"
					alt="Loader"
					width={112}
					height={112}
					loading="lazy"
				/>
				<div className="space-y-2">
					<p className="caps text-xs text-[var(--stone)]">Correspondence</p>
					<h2 id="correspondence" className="home-section-title">
						Let’s work together.
					</h2>
					<p className="text-xl text-[var(--muted)]">
						Have a project in mind? I’d love to hear what you’re working on.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-5">
					<PlateButton to="/contact">Get in touch</PlateButton>
					<SigilLink to="/about">About me</SigilLink>
				</div>
			</section>
		</>
	);
}
