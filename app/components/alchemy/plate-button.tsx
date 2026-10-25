import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { ArmBody, ArmHand, Sigil } from "./glyphs";

/**
 * An engraved plate used for calls to action. On hover the sigil opens, one
 * arm runs along the top edge and wraps the far end, another crawls along the
 * bottom and grips it — the label always stays clear.
 */
export function PlateButton({
	to,
	children,
	variant = "primary",
	className,
}: {
	to: string;
	children: React.ReactNode;
	variant?: "primary" | "secondary";
	className?: string;
}) {
	const primary = variant === "primary";
	return (
		<Link
			to={to}
			viewTransition
			className={twMerge("group relative inline-flex w-fit", className)}
		>
			<span
				className={twMerge(
					"relative inline-flex items-center gap-3.5 pl-4 pr-7 py-[15px] border border-[var(--ink)] caps text-[0.8rem] leading-none transition-colors duration-300",
					primary
						? "bg-[var(--ink)] text-[var(--paper)] group-hover:bg-[var(--muted)]"
						: "bg-[var(--paper)] text-[var(--ink)]",
				)}
				style={
					primary
						? ({
								"--sigil-ink": "var(--paper)",
								"--sigil-paper": "var(--ink)",
							} as React.CSSProperties)
						: undefined
				}
			>
				<span className="pointer-events-none absolute inset-1 border border-current opacity-50" />
				<Sigil size={18} />
				{children}
			</span>
			<span
				className="arm"
				style={{ left: 25, top: -11, right: -16, height: "calc(50% + 11px)" }}
			>
				<ArmBody
					viewBox="0 0 100 30"
					weight={3}
					d="M0 30C0 18 1 8 5 5 20 1 45 4 70 2 85 1 93 0 97 6 100 14 99 24 94 30"
				/>
				<ArmHand
					style={{
						right: 10,
						bottom: -9,
						transform: "rotate(160deg) scale(1.15)",
					}}
				/>
			</span>
			<span
				className="arm"
				style={{
					left: 25,
					top: "50%",
					width: "62%",
					height: "calc(50% + 11px)",
				}}
			>
				<ArmBody
					viewBox="0 0 100 30"
					weight={2.6}
					d="M0 0C0 12 1 22 5 25 25 30 50 26 75 29 88 30 95 27 98 21"
				/>
				<ArmHand
					style={{
						right: -12,
						bottom: -7,
						transform: "rotate(-80deg) scale(1.1)",
					}}
				/>
			</span>
		</Link>
	);
}
