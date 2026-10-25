import { useSearchParams } from "react-router";
import { LazyGateScene } from "~/components/gate-scene/lazy-gate-scene";
import type { Route } from "./+types/route";

export const handle = { plate: "Lab · Porta Veritatis" };

export const meta: Route.MetaFunction = () => [
	{ title: "Lab · The Gate - Loadertsx" },
	{ name: "robots", content: "noindex" },
];

/** Inspect the home scene from any angle: /lab/gate?orbit=60 */
export default function GateLab() {
	const [params] = useSearchParams();
	const orbit = Number(params.get("orbit") ?? 55) || 0;

	return (
		<section className="pt-10 md:pt-16 pb-8 grid gap-10 lg:grid-cols-2 items-start">
			<figure className="space-y-3">
				<LazyGateScene className="aspect-square w-full" />
				<figcaption className="italic text-[var(--muted)]">Frontal</figcaption>
			</figure>
			<figure className="space-y-3">
				<LazyGateScene className="aspect-square w-full" orbit={orbit} />
				<figcaption className="italic text-[var(--muted)]">
					Side view — {orbit}° (change it with ?orbit=)
				</figcaption>
			</figure>
		</section>
	);
}
