import { Link } from "react-router";
import { twMerge } from "tailwind-merge";
import { ArmBody, ArmHand, Sigil } from "./glyphs";

type Target = { to: string; href?: never } | { href: string; to?: never };

/**
 * A small-caps link preceded by a sigil. On hover two arms crawl out of the
 * sigil: one becomes the underline and grips the last letter, the other
 * grips the top of the word.
 */
export function SigilLink({
	children,
	active = false,
	className,
	onClick,
	...target
}: Target & {
	children: React.ReactNode;
	active?: boolean;
	className?: string;
	onClick?: () => void;
}) {
	const classes = twMerge(
		"group relative inline-flex items-center gap-2 caps text-[0.72rem] leading-none py-1 transition-colors duration-200",
		active
			? "text-[var(--ink)]"
			: "text-[var(--muted)] hover:text-[var(--ink)] focus-visible:text-[var(--ink)]",
		className,
	);
	const content = (
		<>
			<Sigil size={11} active={active} />
			<span>{children}</span>
			<span
				className="arm"
				style={{ left: 5.5, top: "50%", right: -8, height: "calc(50% + 7px)" }}
			>
				<ArmBody
					viewBox="0 0 100 20"
					d="M0 0C0 10 1.5 17 5 17 24 19 46 15 63 18 79 20 91 16 97 12"
				/>
				<ArmHand
					style={{ right: -14, bottom: 0, transform: "rotate(-38deg)" }}
				/>
			</span>
			<span
				className="arm"
				style={{
					left: 5.5,
					bottom: "50%",
					right: "45%",
					height: "calc(50% + 7px)",
				}}
			>
				<ArmBody
					viewBox="0 0 100 20"
					weight={1.8}
					d="M0 20C0 10 3 3 9 3 31 1 56 5 80 3 90 2 96 4 99 9"
				/>
				<ArmHand
					style={{ right: -10, top: 0, transform: "rotate(78deg) scale(0.85)" }}
				/>
			</span>
		</>
	);

	if (target.href !== undefined) {
		const external = !target.href.startsWith("mailto:");
		return (
			<a
				href={target.href}
				className={classes}
				onClick={onClick}
				target={external ? "_blank" : undefined}
				rel={external ? "noopener noreferrer" : undefined}
			>
				{content}
			</a>
		);
	}
	return (
		<Link
			to={target.to}
			viewTransition
			className={classes}
			onClick={onClick}
			aria-current={active ? "page" : undefined}
		>
			{content}
		</Link>
	);
}
