import { Menu as MenuIcon, Moon, Sun, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { twMerge } from "tailwind-merge";
import { Theme, useTheme } from "~/utils/theme-provider";

export default function Header({
	setOpenMenu,
	openMenu,
}: {
	setOpenMenu: (open: boolean) => void;
	openMenu: boolean;
}) {
	const [theme, setTheme] = useTheme();

	const links = [
		{ href: "/blog", text: "Blog" },
		{ href: "/projects", text: "Projects" },
		{ href: "/about", text: "About" },
		{ href: "/notes", text: "Notes" },
	];

	const location = useLocation();
	const path = location.pathname.split("/")[1];

	return (
		<header className="relative z-50">
			<div className="max-w-[1280px] mx-auto px-5 py-8 lg:px-[100px] lg:py-10 flex justify-between items-center">
				{/* Logo */}
				<Link
					to="/"
					className="font-serif text-xl tracking-tight transition-colors hover:text-[var(--color-accent)] dark:hover:text-[var(--color-dark-accent)]"
				>
					loader.tsx
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-8">
					<ul className="flex gap-8">
						{links.map((link) => (
							<li key={`link-${link.text}`}>
								<Link
									to={link.href}
									viewTransition
									className={twMerge(
										"text-sm font-medium tracking-wide uppercase transition-colors duration-200",
										link.href === `/${path}`
											? "text-[var(--color-accent)] dark:text-[var(--color-dark-accent)]"
											: "text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)]",
									)}
								>
									{link.text}
								</Link>
							</li>
						))}
					</ul>

					{/* Theme Toggle */}
					<button
						type="button"
						aria-label="Toggle theme"
						className="p-2 rounded-full transition-all duration-200 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-dark-surface)]"
						onClick={() => {
							setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
						}}
					>
						{theme === Theme.DARK ? (
							<Moon className="w-4 h-4" />
						) : (
							<Sun className="w-4 h-4" />
						)}
					</button>
				</nav>

				{/* Mobile Controls */}
				<div className="flex items-center gap-3 md:hidden">
					<button
						type="button"
						aria-label="Toggle theme"
						className="p-2 rounded-full transition-all duration-200 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)]"
						onClick={() => {
							setTheme(theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT);
						}}
					>
						{theme === Theme.DARK ? (
							<Moon className="w-4 h-4" />
						) : (
							<Sun className="w-4 h-4" />
						)}
					</button>

					<button
						aria-label="Open menu"
						type="button"
						className="p-2 transition-colors"
						onClick={() => setOpenMenu(!openMenu)}
					>
						{openMenu ? (
							<X className="w-5 h-5" />
						) : (
							<MenuIcon className="w-5 h-5" />
						)}
					</button>
				</div>
			</div>

			{/* Mobile Navigation */}
			<nav
				className={twMerge(
					"fixed left-0 top-0 h-screen w-full transition-all duration-500 ease-out bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] md:hidden",
					openMenu
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none",
				)}
				style={{ paddingTop: "80px" }}
			>
				<ul className="px-5 space-y-1">
					{links.map((link, index) => (
						<li
							key={`mobile-link-${link.text}`}
							className={twMerge(
								"transform transition-all duration-300",
								openMenu
									? "translate-y-0 opacity-100"
									: "translate-y-4 opacity-0",
							)}
							style={{ transitionDelay: openMenu ? `${index * 50}ms` : "0ms" }}
						>
							<Link
								onClick={() => setOpenMenu(false)}
								to={link.href}
								className={twMerge(
									"block py-4 font-serif text-3xl border-b transition-colors",
									"border-[var(--color-border)] dark:border-[var(--color-dark-border)]",
									link.href === `/${path}`
										? "text-[var(--color-accent)] dark:text-[var(--color-dark-accent)]"
										: "hover:text-[var(--color-accent)] dark:hover:text-[var(--color-dark-accent)]",
								)}
							>
								{link.text}
							</Link>
						</li>
					))}
				</ul>

				{/* Mobile footer */}
				<div className="absolute bottom-0 left-0 right-0 px-5 py-8 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
					<p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
						Building products with care.
					</p>
				</div>
			</nav>
		</header>
	);
}
