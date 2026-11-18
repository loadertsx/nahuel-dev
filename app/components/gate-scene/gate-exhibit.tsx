import { Box, Image } from "lucide-react";
import { useState } from "react";
import { TransmutationCircle } from "~/components/alchemy/glyphs";
import { LazyGateScene } from "./lazy-gate-scene";

const sceneClass = "gate-plate-scene relative aspect-square w-full min-w-0";

export function GateExhibit() {
	const [live, setLive] = useState(false);
	const [unavailable, setUnavailable] = useState(false);
	const poster = (
		<div className={sceneClass}>
			<img
				src="/porta-veritatis.webp"
				srcSet="/porta-veritatis-small.webp 486w, /porta-veritatis.webp 972w"
				sizes="(min-width: 1024px) 44vw, (min-width: 640px) 520px, 90vw"
				alt="The Gate of Truth surrounded by a transmutation circle"
				width={972}
				height={972}
			/>
		</div>
	);

	return (
		<figure className="gate-plate">
			<div id="gate-exhibit" className="gate-plate-stage">
				<TransmutationCircle className="gate-plate-diagram" />
				{live ? (
					<LazyGateScene
						className={sceneClass}
						palette="dark"
						poster={poster}
						onUnavailable={() => {
							setUnavailable(true);
							setLive(false);
						}}
					/>
				) : (
					poster
				)}
			</div>
			<figcaption className="gate-plate-caption">
				<div>
					<p className="text-lg italic">Porta Veritatis</p>
					<p className="caps text-[0.6rem] gate-plate-motto">
						One is all · All is one
					</p>
				</div>
				<button
					type="button"
					className="gate-plate-toggle"
					aria-controls="gate-exhibit"
					onClick={() => {
						setUnavailable(false);
						setLive(!live);
					}}
				>
					{live ? (
						<Image size={16} aria-hidden="true" />
					) : (
						<Box size={16} aria-hidden="true" />
					)}
					{live ? "Show still image" : "Explore in 3D"}
				</button>
				{unavailable && (
					<p className="gate-plate-motto w-full text-sm" role="status">
						The 3D scene could not start on this device.
					</p>
				)}
			</figcaption>
		</figure>
	);
}
