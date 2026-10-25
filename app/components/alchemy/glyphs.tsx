import { twMerge } from "tailwind-merge";

/**
 * The engraved seal every interactive element carries. It opens into the void
 * (and the Stone ignites) when its `.group` ancestor is hovered, focused or
 * pressed, or permanently when `active`.
 */
export function Sigil({
	size = 18,
	active = false,
	className,
}: {
	size?: number;
	active?: boolean;
	className?: string;
}) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 18 18"
			width={size}
			height={size}
			className={twMerge("sigil", className)}
			data-active={active}
		>
			<circle className="sigil-void" cx="9" cy="9" r="8.5" />
			<circle
				cx="9"
				cy="9"
				r="8.5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<path
				className="sigil-seal"
				d="M9 2.6 14.6 12.3H3.4Z"
				fill="none"
				strokeWidth="0.8"
			/>
			<circle
				className="sigil-seal"
				cx="9"
				cy="9"
				r="6.4"
				fill="none"
				strokeWidth="0.5"
			/>
			<circle className="sigil-stone" cx="9" cy="9.6" r="1.25" />
		</svg>
	);
}

const HAND_PARTS = (
	<>
		<ellipse cx="5" cy="7" rx="4.2" ry="3.4" />
		<path d="M8 4.6 14.5 2.6M8.8 6.2l7.4-.6M8.8 7.8l7.4 1M8 9.4l5.8 2.2M5 4l1.8-3.2" />
	</>
);

/** A small open hand pointing right (rotate it into place). */
export function ArmHand({
	style,
	className,
}: {
	style?: React.CSSProperties;
	className?: string;
}) {
	return (
		<svg
			aria-hidden="true"
			viewBox="-2 -2 22 18"
			width="22"
			height="18"
			style={style}
			className={className}
		>
			<g
				className="arm-hand"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{ transformOrigin: "0 7px" }}
			>
				<g
					stroke="var(--arm-paper, var(--paper))"
					strokeWidth="3.4"
					fill="var(--arm-paper, var(--paper))"
				>
					{HAND_PARTS}
				</g>
				<g stroke="currentColor" strokeWidth="1.5" fill="currentColor">
					{HAND_PARTS}
				</g>
			</g>
		</svg>
	);
}

/** The arm itself: a stretchable path (in a 100×N box) drawn over a halo. */
export function ArmBody({
	d,
	viewBox,
	weight = 2.2,
}: {
	d: string;
	viewBox: string;
	weight?: number;
}) {
	return (
		<svg
			aria-hidden="true"
			className="arm-body"
			viewBox={viewBox}
			preserveAspectRatio="none"
		>
			<path
				className="arm-halo"
				d={d}
				strokeWidth={weight + 2.4}
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
			<path
				className="arm-stroke"
				d={d}
				strokeWidth={weight}
				strokeLinecap="round"
				vectorEffect="non-scaling-stroke"
			/>
		</svg>
	);
}

/** Serpent devouring its tail — the logo mark. */
export function Ouroboros({ size = 28 }: { size?: number }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 40 40"
			width={size}
			height={size}
			className="text-[var(--ink)] flex-none"
		>
			<path
				d="M30.4 8.1A15.5 15.5 0 1 1 13 6.6"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
			/>
			<ellipse
				cx="21.2"
				cy="5.6"
				rx="3.6"
				ry="2.5"
				transform="rotate(14 21.2 5.6)"
				fill="currentColor"
			/>
		</svg>
	);
}

const PLANETS = ["☉", "☿", "♀", "☽", "♂", "♃"];
const SCRIPT =
	"Quod est inferius est sicut quod est superius · solve et coagula · ex uno omnia, et in unum omnia · materia prima · ";

const point = (r: number, deg: number) => {
	const a = (deg * Math.PI) / 180;
	return [200 + r * Math.cos(a), 200 + r * Math.sin(a)] as const;
};

/** The engraved transmutation circle with the Philosopher's Stone at its heart. */
export function TransmutationCircle({ className }: { className?: string }) {
	const ticks = Array.from({ length: 48 }, (_, i) => i * 7.5);
	const tri = (offset: number) =>
		[0, 1, 2].map((i) => point(150, offset + i * 120).join(" ")).join(" L ");
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 400 400"
			className={twMerge("text-[var(--ink)]", className)}
			fill="none"
			stroke="currentColor"
		>
			<defs>
				<path
					id="tc-outer"
					d="M200 32a168 168 0 1 1 0 336a168 168 0 1 1 0-336"
				/>
				<path id="tc-inner" d="M200 152a48 48 0 1 1 0 96a48 48 0 1 1 0-96" />
			</defs>
			<circle cx="200" cy="200" r="196" strokeWidth="2" />
			<circle cx="200" cy="200" r="184" strokeWidth="1" />
			{ticks.map((deg, i) => {
				const [x1, y1] = point(186, deg);
				const [x2, y2] = point(i % 4 === 0 ? 195 : 191, deg);
				return (
					<line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1" />
				);
			})}
			<text
				fill="currentColor"
				stroke="none"
				fontFamily="var(--font-script)"
				fontSize="12.5"
			>
				<textPath href="#tc-outer">{SCRIPT + SCRIPT}</textPath>
			</text>
			<circle cx="200" cy="200" r="150" strokeWidth="1.5" />
			<path d={`M ${tri(-90)} Z`} strokeWidth="1.5" />
			<path d={`M ${tri(90)} Z`} strokeWidth="1.5" />
			<circle cx="200" cy="200" r="75" strokeWidth="1.5" />
			<rect
				x="147"
				y="147"
				width="106"
				height="106"
				strokeWidth="1"
				transform="rotate(0 200 200)"
			/>
			<text
				fill="currentColor"
				stroke="none"
				fontFamily="var(--font-script)"
				fontSize="9"
			>
				<textPath href="#tc-inner">
					Solve et coagula · nigredo · albedo · rubedo · lapis
				</textPath>
			</text>
			{PLANETS.map((g, i) => {
				const [x, y] = point(150, -90 + i * 60);
				return (
					<g key={g}>
						<circle
							cx={x}
							cy={y}
							r="14"
							fill="var(--paper)"
							strokeWidth="1.5"
						/>
						<text
							x={x}
							y={y + 5}
							textAnchor="middle"
							fill="currentColor"
							stroke="none"
							fontFamily="var(--font-symbols)"
							fontSize="14"
						>
							{g}
						</text>
					</g>
				);
			})}
			<circle cx="200" cy="200" r="19" fill="var(--paper)" strokeWidth="1" />
			<g transform="translate(186 183)">
				<path
					d="M14 1 27 10 23.5 27.5 14 33 4.5 27.5 1 10Z"
					fill="var(--stone)"
					stroke="currentColor"
					strokeWidth="1"
				/>
				<path
					d="M14 6.5 21 12 18.5 23 14 26.5 9.5 23 7 12Z"
					strokeWidth="0.6"
					opacity="0.55"
				/>
			</g>
		</svg>
	);
}
