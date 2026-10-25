import { twMerge } from "tailwind-merge";

/** Two hairlines meeting at a small star. */
export function Ornament({ className }: { className?: string }) {
	return (
		<div
			aria-hidden="true"
			className={twMerge("flex items-center gap-3.5", className)}
		>
			<span className="h-px flex-1 bg-[var(--ink)]" />
			<span className="font-symbols text-[0.7rem] leading-none">✦</span>
			<span className="h-px flex-1 bg-[var(--ink)]" />
		</div>
	);
}

/** "FIG. III —— SELECTED WORK" */
export function Eyebrow({ fig, label }: { fig: string; label: string }) {
	return (
		<p className="flex flex-wrap items-center gap-x-3.5 gap-y-1 caps text-[0.75rem]">
			<span>{fig}</span>
			<span aria-hidden="true" className="h-px w-10 bg-[var(--ink)]" />
			<span className="text-[var(--muted)]">{label}</span>
		</p>
	);
}

/**
 * The opening of every plate: eyebrow, a large two-line title whose second
 * line is italic, and a lede that sits beside it on wide screens.
 */
export function PlateIntro({
	fig,
	label,
	title,
	titleItalic,
	lede,
	note,
}: {
	fig: string;
	label: string;
	title: string;
	titleItalic: string;
	lede: React.ReactNode;
	note?: string;
}) {
	return (
		<header className="space-y-6 md:space-y-7 pt-10 md:pt-20 pb-8 md:pb-14">
			<Eyebrow fig={fig} label={label} />
			<div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
				<h1 className="font-serif font-light display-plate leading-[0.9] tracking-[-0.02em]">
					{title}
					<br />
					<em className="font-light">{titleItalic}</em>
				</h1>
				<div className="xl:w-[460px] space-y-2.5 xl:pb-3">
					<p className="text-[1.125rem] md:text-[1.25rem] leading-[1.5] text-[var(--muted)]">
						{lede}
					</p>
					{note && (
						<p className="font-script text-[1.6rem] text-[var(--muted)]">
							{note}
						</p>
					)}
				</div>
			</div>
		</header>
	);
}
