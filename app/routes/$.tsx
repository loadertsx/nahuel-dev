import { TransmutationCircle } from "~/components/alchemy/glyphs";
import { Eyebrow } from "~/components/alchemy/ornament";
import { PlateButton } from "~/components/alchemy/plate-button";

import type { Route } from "./+types/$";

export const handle = { plate: "Plate ∅ · Lost to the Gate" };

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
		<section className="relative min-h-[70vh] grid place-items-center py-16 overflow-hidden">
			<TransmutationCircle className="absolute size-[min(90vw,620px)] opacity-[0.12]" />
			<div className="relative flex flex-col items-center text-center gap-6">
				<Eyebrow fig="Fig. 404" label="Lost to the Gate" />
				<h1 className="font-serif font-light text-[6rem] md:text-[10rem] leading-[0.85] tracking-[-0.03em]">
					4<em className="font-light">0</em>4
				</h1>
				<p className="max-w-md text-[1.15rem] leading-[1.5] text-[var(--muted)]">
					This page was taken as the toll. Whatever you were looking for, it
					isn't here — perhaps it never was.
				</p>
				<div className="flex flex-col sm:flex-row gap-4 pt-2">
					<PlateButton to="/">Back to home</PlateButton>
					<PlateButton to="/projects" variant="secondary">
						View my work
					</PlateButton>
				</div>
			</div>
		</section>
	);
}
