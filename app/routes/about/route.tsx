import { Eyebrow, Ornament } from "~/components/alchemy/ornament";
import MePNG from "/me.png?url";
import type { Route } from "../about/+types/route";

export const handle = { plate: "Plate V · The Alchemist" };

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "About - Loadertsx" },
		{ name: "description", content: "About Loadertsx - Software Developer" },
	];
};

const REAGENTS = [
	["Re", "React"],
	["Ts", "TypeScript"],
	["Nx", "Next.js"],
	["Rx", "Remix"],
	["Tw", "Tailwind"],
	["Sb", "Supabase"],
	["Cf", "Cloudflare"],
];

function Chapter({
	numeral,
	title,
	children,
}: {
	numeral: string;
	title: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col md:flex-row gap-4 md:gap-10 pt-7 border-t border-[var(--ink)]">
			<header className="md:w-[200px] xl:w-[320px] flex-none space-y-1.5">
				<p className="caps text-[0.8rem]">{numeral}</p>
				<h2 className="font-serif font-medium text-[2rem] md:text-[2.5rem] leading-[1.05]">
					{title}
				</h2>
			</header>
			<div className="flex-1 space-y-[18px] text-[1.125rem] md:text-[1.25rem] leading-[1.55]">
				{children}
			</div>
		</section>
	);
}

export default function About() {
	return (
		<div className="pb-8 space-y-12 md:space-y-14">
			<section className="flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-8 md:gap-14 pt-10 md:pt-20">
				<div className="flex-1 space-y-6 md:space-y-7">
					<Eyebrow fig="Fig. V" label="The Alchemist" />
					<h1 className="font-serif font-light display-plate leading-[0.9] tracking-[-0.02em]">
						A bit
						<br />
						<em className="font-light">about me.</em>
					</h1>
					<p className="text-[1.125rem] md:text-[1.25rem] leading-[1.55]">
						Hello! I'm Loader, a software developer passionate about building
						products that people love to use. I believe in the craft of software
						development — writing code that's not just functional, but elegant
						and maintainable.
					</p>
					<p className="text-[1.125rem] md:text-[1.25rem] leading-[1.55] text-[var(--muted)]">
						My expertise lies in the modern web stack: React, TypeScript,
						Next.js and Remix. I use Tailwind CSS to style my work with both
						precision and efficiency. Beyond the frontend, I enjoy working with
						databases and APIs, currently favoring tools like Supabase and
						Cloudflare's edge platform.
					</p>
				</div>
				<figure className="flex flex-col items-center gap-3.5 self-center md:self-start">
					<div className="relative w-[230px] md:w-[220px] xl:w-[320px] aspect-[4/5] rounded-[50%] border border-[var(--ink)] p-3">
						<img
							src={MePNG}
							alt="Loader"
							className="size-full rounded-[50%] object-cover grayscale contrast-125"
						/>
						<span
							aria-hidden="true"
							className="pointer-events-none absolute inset-3 rounded-[50%] border border-[var(--ink)] opacity-60"
						/>
					</div>
					<figcaption className="italic text-[0.95rem] text-[var(--muted)]">
						Fig. V — The alchemist at work
					</figcaption>
				</figure>
			</section>

			<Chapter numeral="I." title="My approach">
				<p>
					I care deeply about the details. Every interaction, every transition,
					every piece of feedback matters. Good software should feel invisible —
					it should work so naturally that users don't have to think about it.
				</p>
				<p className="text-[var(--muted)]">
					When I build products, I think about the person on the other side of
					the screen. What do they need? What might frustrate them? How can I
					make their experience just a little bit better?
				</p>
			</Chapter>

			<Chapter numeral="II." title="Currently">
				<p>
					I'm exploring the edges of what's possible on the web — from edge
					computing to AI integrations, from real-time collaboration to
					offline-first applications. The web platform keeps evolving, and I'm
					excited to evolve with it.
				</p>
			</Chapter>

			<blockquote className="not-italic border-0 p-0 flex flex-col items-center gap-3 py-2 md:py-6 text-center">
				<Ornament className="w-full [&>span:first-child]:bg-[var(--rule)] [&>span:last-child]:bg-[var(--rule)]" />
				<p className="font-script text-[2.2rem] md:text-[3.3rem] leading-[1.2] text-[var(--ink)]">
					Good software should feel invisible.
				</p>
				<cite className="not-italic caps text-[0.68rem] text-[var(--muted)]">
					— On the craft
				</cite>
			</blockquote>

			<Chapter numeral="III." title="Reagents">
				<p className="italic text-[var(--muted)]">
					The elements I transmute with most often.
				</p>
				<ul className="flex flex-wrap gap-3 md:gap-3.5">
					{REAGENTS.map(([symbol, name], i) => (
						<li
							key={symbol}
							className="relative flex flex-col items-center justify-center gap-1.5 w-[100px] h-[116px] md:w-[108px] md:h-[124px] border border-[var(--ink)]"
						>
							<span className="absolute left-2.5 top-2 caps text-[0.62rem] text-[var(--muted)]">
								{i + 1}
							</span>
							<span className="font-serif font-medium text-[2.8rem] leading-none">
								{symbol}
							</span>
							<span className="caps text-[0.55rem] text-[var(--muted)]">
								{name}
							</span>
						</li>
					))}
				</ul>
			</Chapter>
		</div>
	);
}
