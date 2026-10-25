import { Link } from "react-router";
import { ArmBody, ArmHand, Sigil } from "./glyphs";

/**
 * One entry of a table of contents (blog posts, notes). Wide screens show the
 * numeral and a dotted leader to the date; on hover the sigil opens and an arm
 * crawls out to underline the title.
 */
export function IndexRow({
	to,
	numeral,
	title,
	subtitle,
	date,
}: {
	to: string;
	numeral?: string;
	title: string;
	subtitle?: string | null;
	date?: string | null;
}) {
	return (
		<Link
			to={to}
			prefetch="intent"
			viewTransition
			// Everything hangs from the title's first line, so the sigil (and the
			// arm that leaves it) stays on that line however long the subtitle is.
			className="group flex items-start gap-3.5 md:gap-5 py-[18px] md:py-[22px] border-b border-[var(--rule)] [--sigil-reach:21px] md:[--sigil-reach:27px]"
		>
			{numeral && (
				<span className="hidden md:block w-10 flex-none mt-2 caps text-[0.72rem] text-[var(--muted)]">
					{numeral}
				</span>
			)}
			{/* centred on the title's first line: (1.15em line − 14px) / 2 */}
			<Sigil size={14} className="mt-[7px] md:mt-[9px]" />
			<span className="flex flex-col gap-1 min-w-0">
				<span className="relative font-serif font-medium text-[1.5rem] md:text-[1.75rem] leading-[1.15] group-hover:italic">
					{title}
					{/* starts at the sigil's centre: one gap + half a sigil to the left,
					    half a line down */}
					<span
						className="arm"
						style={{
							left: "calc(-1 * var(--sigil-reach))",
							top: "0.575em",
							width: "min(100% + var(--sigil-reach), 287px)",
							height: "calc(100% - 0.575em + 7px)",
						}}
					>
						<ArmBody
							viewBox="0 0 100 20"
							weight={2}
							d="M0 0C-1 9 2 18 9 18 34 20 60 16 84 19 92 20 97 18 99 14"
						/>
						<ArmHand
							style={{
								right: -14,
								bottom: 2,
								transform: "rotate(-30deg) scale(0.9)",
							}}
						/>
					</span>
				</span>
				{subtitle && (
					<span className="italic text-[0.95rem] text-[var(--muted)]">
						{subtitle}
					</span>
				)}
				{date && (
					<span className="md:hidden caps text-[0.68rem] text-[var(--muted)]">
						{date}
					</span>
				)}
			</span>
			<span
				aria-hidden="true"
				className="hidden md:block flex-1 min-w-8 mt-[21px] border-b border-dotted border-[var(--rule-strong)]"
			/>
			{date && (
				<span className="hidden md:block flex-none mt-2 caps text-[0.72rem] text-[var(--muted)]">
					{date}
				</span>
			)}
		</Link>
	);
}
