import { Link, useLocation, useMatches } from "react-router";
import { twMerge } from "tailwind-merge";
import { CONTACT_LINKS } from "~/utils/contact";
import { Theme, useTheme } from "~/utils/theme-provider";
import { Ouroboros, Sigil } from "./alchemy/glyphs";
import { Ornament } from "./alchemy/ornament";
import { SigilLink } from "./alchemy/sigil-link";

const LINKS = [
	{ href: "/blog", text: "Blog" },
	{ href: "/projects", text: "Projects" },
	{ href: "/about", text: "About" },
	{ href: "/notes", text: "Notes" },
];

const MENU = [{ href: "/", text: "Home" }, ...LINKS];
const MENU_NUMERALS = ["I", "II", "III", "IV", "V"];

/** Routes describe themselves with `handle = { plate: "PLATE III · …" }`. */
function usePlateLabel() {
	const matches = useMatches();
	for (let i = matches.length - 1; i >= 0; i--) {
		const handle = matches[i].handle as { plate?: string } | undefined;
		if (handle?.plate) return handle.plate;
	}
	return null;
}

function ThemeToggle() {
	const [theme, setTheme] = useTheme();
	const dark = theme === Theme.DARK;
	return (
		<button
			type="button"
			aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
			className="grid place-items-center size-[34px] rounded-full border border-[var(--ink)] font-symbols text-base leading-none transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
			onClick={() => setTheme(dark ? Theme.LIGHT : Theme.DARK)}
		>
			{dark ? "☉" : "☽"}
		</button>
	);
}

export default function Header({
	setOpenMenu,
	openMenu,
}: {
	setOpenMenu: (open: boolean) => void;
	openMenu: boolean;
}) {
	const [theme, setTheme] = useTheme();
	const plate = usePlateLabel();
	const { pathname } = useLocation();
	const section = `/${pathname.split("/")[1]}`;
	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : section === href;

	return (
		<header className="relative z-50 px-[22px] md:px-10 xl:px-[72px] pt-[22px] md:pt-10">
			<div className="flex items-center justify-between gap-6 pb-4 md:pb-6">
				<Link
					to="/"
					viewTransition
					className="flex items-center gap-2.5 font-serif font-medium text-[1.4rem] md:text-[1.6rem] tracking-[-0.01em]"
				>
					<Ouroboros size={28} />
					loader.tsx
				</Link>

				{plate && (
					<p className="hidden xl:block caps text-[0.68rem] tracking-[0.3em] text-[var(--muted)]">
						{plate}
					</p>
				)}

				<nav className="hidden md:flex items-center gap-[22px] xl:gap-[34px]">
					{LINKS.map((link) => (
						<SigilLink
							key={link.href}
							to={link.href}
							active={isActive(link.href)}
						>
							{link.text}
						</SigilLink>
					))}
					<ThemeToggle />
				</nav>

				<div className="flex items-center gap-3 md:hidden">
					<ThemeToggle />
					<button
						aria-label="Open the index of plates"
						type="button"
						className="grid place-items-center size-[34px] rounded-full border border-[var(--ink)]"
						onClick={() => setOpenMenu(true)}
					>
						<span className="flex flex-col items-center gap-[4px]">
							<span className="block h-px w-3.5 bg-[var(--ink)]" />
							<span className="block h-px w-2.5 bg-[var(--ink)]" />
							<span className="block h-px w-3.5 bg-[var(--ink)]" />
						</span>
					</button>
				</div>
			</div>
			<Ornament />

			{/* Mobile: the index of plates */}
			<nav
				aria-hidden={!openMenu}
				className={twMerge(
					"plate fixed inset-0 z-50 overflow-y-auto bg-[var(--paper)] px-[22px] pt-[34px] pb-10 transition-opacity duration-300 md:hidden",
					openMenu
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none",
				)}
			>
				<div className="flex items-center justify-between pb-4">
					<Link
						to="/"
						onClick={() => setOpenMenu(false)}
						className="flex items-center gap-2.5 font-serif font-medium text-[1.4rem]"
					>
						<Ouroboros size={24} />
						loader.tsx
					</Link>
					<button
						type="button"
						aria-label="Close the index of plates"
						className="grid place-items-center size-[34px] rounded-full border border-[var(--ink)] font-symbols text-[0.8rem]"
						onClick={() => setOpenMenu(false)}
					>
						✕
					</button>
				</div>
				<Ornament className="mb-10" />
				<p className="caps text-[0.7rem] tracking-[0.3em] text-[var(--muted)]">
					Index of plates
				</p>
				<ul className="mt-4">
					{MENU.map((link, i) => {
						const active = isActive(link.href);
						return (
							<li
								key={link.href}
								className={twMerge(
									"border-b border-[var(--rule)] transition-all duration-300",
									openMenu
										? "translate-y-0 opacity-100"
										: "translate-y-3 opacity-0",
								)}
								style={{ transitionDelay: openMenu ? `${i * 50}ms` : "0ms" }}
							>
								<Link
									to={link.href}
									viewTransition
									onClick={() => setOpenMenu(false)}
									className="group flex items-center gap-4 py-4"
								>
									<Sigil size={22} active={active} />
									<span
										className={twMerge(
											"flex-1 font-serif text-[2.6rem] leading-none tracking-[-0.01em]",
											active ? "italic font-light" : "font-medium",
										)}
									>
										{link.text}
									</span>
									<span className="caps text-[0.72rem] text-[var(--muted)]">
										{MENU_NUMERALS[i]}
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
				<div className="flex flex-wrap gap-x-6 gap-y-3 pt-9">
					{CONTACT_LINKS.map((link) => (
						<SigilLink key={link.href} href={link.href}>
							{link.label}
						</SigilLink>
					))}
				</div>
				<div className="flex items-center gap-3 pt-7 caps text-[0.72rem]">
					<button
						type="button"
						onClick={() => setTheme(Theme.LIGHT)}
						className={
							theme === Theme.LIGHT
								? "text-[var(--ink)]"
								: "text-[var(--muted)]"
						}
					>
						<span className="font-symbols">☉</span> Light
					</button>
					<span className="text-[var(--muted)]">·</span>
					<button
						type="button"
						onClick={() => setTheme(Theme.DARK)}
						className={
							theme === Theme.DARK ? "text-[var(--ink)]" : "text-[var(--muted)]"
						}
					>
						<span className="font-symbols">☽</span> Dark
					</button>
				</div>
			</nav>
		</header>
	);
}
