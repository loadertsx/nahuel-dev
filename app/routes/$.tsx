import { Compass, Home } from "lucide-react";
import { Link } from "react-router";

import type { Route } from "./+types/$";

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "Page Not Found - Loadertsx" },
		{
			name: "description",
			content: "This page could not be found.",
		},
	];
};

export default function NotFound() {
	return (
		<section className="min-h-[70vh] flex flex-col items-center justify-center py-12 md:py-20">
			{/* Floating dots decoration */}
			<div className="flex items-center gap-3 mb-8">
				<span
					className="w-2 h-2 rounded-full bg-[var(--color-accent)] dark:bg-[var(--color-dark-accent)] animate-pulse"
					style={{ animationDuration: "2s", animationDelay: "0ms" }}
				/>
				<span
					className="w-2 h-2 rounded-full bg-[var(--color-border-strong)] dark:bg-[var(--color-dark-border-strong)] animate-pulse"
					style={{ animationDuration: "2s", animationDelay: "400ms" }}
				/>
				<span
					className="w-2 h-2 rounded-full bg-[var(--color-accent)] dark:bg-[var(--color-dark-accent)] animate-pulse"
					style={{ animationDuration: "2s", animationDelay: "800ms" }}
				/>
			</div>

			{/* Large 404 */}
			<div className="relative select-none mb-6">
				<span
					className="text-[8rem] md:text-[12rem] lg:text-[14rem] font-serif font-light leading-none text-[var(--color-border)] dark:text-[var(--color-dark-border)] tracking-tighter"
					style={{
						animation: "float 6s ease-in-out infinite",
					}}
				>
					404
				</span>
				{/* Subtle shadow/reflection */}
				<div
					className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 rounded-full bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] blur-xl opacity-50"
					style={{
						animation: "shadow-pulse 6s ease-in-out infinite",
					}}
				/>
			</div>

			{/* Content */}
			<div className="text-center max-w-md space-y-4 mb-10">
				<h1 className="text-2xl md:text-3xl font-serif">
					Well, this is awkward
				</h1>

				<p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
					We couldn't find what you're looking for. Perhaps it's hiding, or
					maybe it was never here to begin with.
				</p>
			</div>

			{/* CTAs */}
			<div className="flex flex-col sm:flex-row gap-4">
				<Link
					to="/"
					viewTransition
					className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide bg-[var(--color-text)] dark:bg-[var(--color-dark-text)] text-[var(--color-bg)] dark:text-[var(--color-dark-bg)] rounded-full transition-all duration-300 hover:gap-3"
				>
					<Home className="w-4 h-4" />
					Back to home
				</Link>

				<Link
					to="/projects"
					viewTransition
					className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide border border-[var(--color-border-strong)] dark:border-[var(--color-dark-border-strong)] rounded-full transition-all duration-300 hover:border-[var(--color-text)] dark:hover:border-[var(--color-dark-text)]"
				>
					<Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
					View my work
				</Link>
			</div>

			{/* Quick links */}
			<div className="flex items-center gap-6 mt-16 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
				<span className="text-xs font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
					Quick links
				</span>
				<div className="flex items-center gap-4 text-sm">
					<Link
						to="/blog"
						viewTransition
						className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors link-underline"
					>
						Blog
					</Link>
					<Link
						to="/notes"
						viewTransition
						className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors link-underline"
					>
						Notes
					</Link>
					<Link
						to="/about"
						viewTransition
						className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors link-underline"
					>
						About
					</Link>
				</div>
			</div>

			{/* Keyframe animations via style tag */}
			<style>
				{`
					@keyframes float {
						0%, 100% {
							transform: translateY(0);
						}
						50% {
							transform: translateY(-12px);
						}
					}

					@keyframes shadow-pulse {
						0%, 100% {
							transform: translateX(-50%) scaleX(1);
							opacity: 0.5;
						}
						50% {
							transform: translateX(-50%) scaleX(0.8);
							opacity: 0.3;
						}
					}
				`}
			</style>
		</section>
	);
}
