import { SigilLink } from "~/components/alchemy/sigil-link";
import { toRoman } from "~/utils/manuscript";

const GLYPHS = ["☿", "♀", "♂", "♃", "♄", "☉", "☽"];

/** One project as an engraved plate: numeral, planetary glyph, reagents. */
export default function CardProject({
	title,
	content,
	deployLink,
	codeLink,
	tags,
	index = 0,
}: {
	title: string;
	content: string;
	/** Omitted for projects without a public site (e.g. packages). */
	deployLink?: string;
	codeLink: string;
	tags: string[];
	index?: number;
}) {
	return (
		<article className="relative flex flex-col gap-[18px] border border-[var(--ink)] bg-[var(--paper)] px-6 py-[26px] md:px-9 md:py-8">
			<span
				aria-hidden="true"
				className="pointer-events-none absolute inset-1.5 border border-[var(--ink)] opacity-45"
			/>
			<div className="flex items-center justify-between">
				<span className="caps text-[0.72rem] text-[var(--muted)]">
					No. {toRoman(index + 1)}
				</span>
				<span aria-hidden="true" className="font-symbols text-2xl leading-none">
					{GLYPHS[index % GLYPHS.length]}
				</span>
			</div>
			<h3 className="font-serif font-medium text-[2.1rem] md:text-[2.5rem] leading-[1.05] tracking-[-0.01em]">
				{title}
			</h3>
			<p className="text-[1.08rem] leading-[1.5] text-[var(--muted)]">
				{content}
			</p>
			<p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1.5">
				<span className="caps text-[0.62rem] tracking-[0.24em] text-[var(--muted)]">
					Reagents
				</span>
				<span className="caps text-[0.7rem] tracking-[0.14em]">
					{tags.join(" · ")}
				</span>
			</p>
			<div className="mt-auto flex gap-7 border-t border-[var(--rule)] pt-[18px]">
				{deployLink && <SigilLink href={deployLink}>Visit</SigilLink>}
				<SigilLink href={codeLink}>Source</SigilLink>
			</div>
		</article>
	);
}
