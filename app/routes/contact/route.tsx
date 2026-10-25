import { Sigil } from "~/components/alchemy/glyphs";
import { PlateIntro } from "~/components/alchemy/ornament";
import { CONTACT_LINKS } from "~/utils/contact";
import type { Route } from "../contact/+types/route";

export const handle = { plate: "Plate VII · Correspondence" };

export const meta: Route.MetaFunction = () => {
	return [
		{ title: "Contact - Loadertsx" },
		{ name: "description", content: "Get in touch with Loader" },
	];
};

export default function Contact() {
	return (
		<section className="pb-8">
			<PlateIntro
				fig="Fig. VII"
				label="Correspondence"
				title="Let's work"
				titleItalic="together."
				lede="I'm always open to new opportunities, collaborations, or just a good conversation about building products."
				note="— I typically respond within a few days"
			/>
			<ul className="border-t border-[var(--ink)] max-w-[900px]">
				{CONTACT_LINKS.map((link) => {
					const external = !link.href.startsWith("mailto:");
					return (
						<li key={link.label} className="border-b border-[var(--rule)]">
							<a
								href={link.href}
								target={external ? "_blank" : undefined}
								rel={external ? "noopener noreferrer" : undefined}
								className="group flex items-center gap-4 md:gap-6 py-5 md:py-6"
							>
								<Sigil size={18} />
								<span className="flex flex-col gap-1 min-w-0">
									<span className="caps text-[0.68rem] text-[var(--muted)]">
										{link.label}
									</span>
									<span className="font-serif font-medium text-[1.6rem] md:text-[2.1rem] leading-[1.1] break-words group-hover:italic">
										{link.value}
									</span>
								</span>
								<span
									aria-hidden="true"
									className="hidden md:block flex-1 min-w-8 border-b border-dotted border-[var(--rule-strong)] translate-y-1"
								/>
								<span className="hidden md:block italic text-[var(--muted)]">
									{link.description}
								</span>
							</a>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
