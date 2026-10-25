import { CONTACT_LINKS } from "~/utils/contact";
import { toRoman } from "~/utils/manuscript";
import { SigilLink } from "./alchemy/sigil-link";

export default function Footer() {
	return (
		<footer className="mx-6 md:mx-14 xl:mx-[120px] mt-16 md:mt-24 pt-9 pb-10 md:pb-14 border-t border-[var(--rule)] flex flex-col md:flex-row md:items-center md:justify-between gap-5">
			<div className="flex flex-col md:flex-row md:items-center gap-3.5 md:gap-7">
				<span className="caps text-[0.68rem] tracking-[0.3em] text-[var(--muted)]">
					Connect
				</span>
				<div className="flex flex-wrap gap-x-6 gap-y-2">
					{CONTACT_LINKS.map((link) => (
						<SigilLink key={link.href} href={link.href}>
							{link.label}
						</SigilLink>
					))}
				</div>
			</div>
			<p className="font-script text-[1.5rem] text-[var(--muted)]">
				Solve et coagula — {toRoman(new Date().getFullYear())}
			</p>
		</footer>
	);
}
