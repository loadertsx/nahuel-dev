import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	AdditiveBlending,
	BufferAttribute,
	BufferGeometry,
	CatmullRomCurve3,
	Color,
	type Group,
	type LineBasicMaterial,
	type LineSegments,
	type Mesh,
	type MeshBasicMaterial,
	type MeshStandardMaterial,
	NormalBlending,
	Plane,
	type PointLight,
	Quaternion,
	type Texture,
	Vector3,
} from "three";
import { Theme, useTheme } from "~/utils/theme-provider";
import {
	makeCircleTexture,
	makeDoorTextures,
	PALETTES,
	type Palette,
} from "./textures";

// The ritual plays once — rise → open → arms reach — and then holds: the gate
// stays open and the arms keep writhing forever. Reduced motion shows a still
// frame of that held state.
const STILL_MOMENT = 9;
const BLINK_EVERY = 7;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
	const t = clamp01((x - a) / (b - a));
	return t * t * (3 - 2 * t);
};

const window4 = (a: number, b: number, c: number, d: number, x: number) =>
	smooth(a, b, x) - smooth(c, d, x);

function timeline(time: number, still: boolean) {
	const k = still ? STILL_MOMENT : time;
	// First blink at 8.6s, then one every BLINK_EVERY seconds.
	const sinceBlink =
		k < 8.6
			? k - 8.6
			: ((k - 8.6 + BLINK_EVERY / 2) % BLINK_EVERY) - BLINK_EVERY / 2;
	return {
		k,
		rise: smooth(1.2, 3.6, k),
		open: smooth(3.8, 5.2, k),
		reach: (delay: number) => smooth(5.2 + delay, 7.4 + delay, k),
		blink: 1 - Math.exp(-((sinceBlink / 0.09) ** 2)),
		// The alchemical reaction flares as the circle wakes and the gate rises.
		flare: still ? 0 : window4(0.2, 1, 3.6, 5.4, k),
	};
}

// Everything that belongs to the gate is cut by the floor while it rises.
const FLOOR_CLIP = [new Plane(new Vector3(0, 1, 0), 0)];

const DOOR_W = 1;
const DOOR_H = 3;
const DOOR_Y = 0.12 + DOOR_H / 2;
// How far each leaf swings toward the viewer when fully open (~43°).
const OPEN_ANGLE = 0.75;
// Minimum distance an arm keeps from the face of a leaf.
const LEAF_CLEARANCE = 0.16;

/**
 * Arms come out through the gap and must wrap around the leaves, never pass
 * through them: push any point that falls behind an open leaf back in front
 * of its face.
 */
function keepInFrontOfLeaves(p: Vector3, open: number) {
	const a = open * OPEN_ANGLE;
	if (a < 0.01 || p.y < 0.05 || p.y > 0.12 + DOOR_H + 0.05) return;
	const ax = Math.abs(p.x);
	const edge = DOOR_W * (1 - Math.cos(a));
	if (ax < edge - 0.06 || ax > DOOR_W + 0.08 || p.z < -0.2) return;
	const face = (DOOR_W - Math.min(ax, DOOR_W)) * Math.tan(a);
	if (p.z < face + LEAF_CLEARANCE) p.z = face + LEAF_CLEARANCE;
}

type ArmDef = {
	// "reach": out through the gap, past the leaf edges, then sideways.
	// "hook": curls around a leaf's free edge and grips its front face.
	kind: "reach" | "hook";
	y: number;
	side: 1 | -1;
	rise: number;
	length: number;
	phase: number;
	delay: number;
};

const ARMS: ArmDef[] = [
	{ kind: "reach", y: 2.7, side: -1, rise: 0.6, length: 2, phase: 0, delay: 0 },
	{
		kind: "hook",
		y: 2.3,
		side: 1,
		rise: 0.15,
		length: 0,
		phase: 1.3,
		delay: 0.2,
	},
	{
		kind: "reach",
		y: 1.9,
		side: 1,
		rise: 0.3,
		length: 2.2,
		phase: 2.1,
		delay: 0.4,
	},
	{
		kind: "hook",
		y: 1.5,
		side: -1,
		rise: -0.1,
		length: 0,
		phase: 0.7,
		delay: 0.1,
	},
	{
		kind: "reach",
		y: 1.1,
		side: -1,
		rise: -0.5,
		length: 1.7,
		phase: 2.8,
		delay: 0.6,
	},
	{
		kind: "hook",
		y: 0.8,
		side: 1,
		rise: -0.15,
		length: 0,
		phase: 3.4,
		delay: 0.7,
	},
	{
		kind: "reach",
		y: 3,
		side: 1,
		rise: 0.8,
		length: 1.5,
		phase: 1.9,
		delay: 0.5,
	},
];

const SEGMENTS = 48;
const RADIAL = 10;

/** A tube whose radius tapers from shoulder to wrist, rebuilt every frame. */
function createTaperedTube() {
	const geometry = new BufferGeometry();
	const positions = new Float32Array((SEGMENTS + 1) * RADIAL * 3);
	geometry.setAttribute("position", new BufferAttribute(positions, 3));
	const index: number[] = [];
	for (let i = 0; i < SEGMENTS; i++) {
		for (let j = 0; j < RADIAL; j++) {
			const a = i * RADIAL + j;
			const b = i * RADIAL + ((j + 1) % RADIAL);
			const c = (i + 1) * RADIAL + j;
			const d = (i + 1) * RADIAL + ((j + 1) % RADIAL);
			index.push(a, c, b, b, c, d);
		}
	}
	geometry.setIndex(index);
	return geometry;
}

const UP = new Vector3(0, 1, 0);
const FORWARD = new Vector3(0, 0, 1);

function Arm({
	def,
	color,
	reduced,
}: {
	def: ArmDef;
	color: string;
	reduced: boolean;
}) {
	const geometry = useMemo(createTaperedTube, []);
	const tube = useRef<Mesh>(null);
	const hand = useRef<Group>(null);
	const fingers = useRef<Group>(null);
	const curve = useMemo(
		() =>
			new CatmullRomCurve3([
				new Vector3(),
				new Vector3(),
				new Vector3(),
				new Vector3(),
				new Vector3(),
			]),
		[],
	);
	const scratch = useMemo(
		() => ({
			p: new Vector3(),
			q: new Vector3(),
			t: new Vector3(),
			n: new Vector3(),
			b: new Vector3(),
			quat: new Quaternion(),
		}),
		[],
	);

	// The spine plus a travelling wave, so arms writhe instead of pointing,
	// then nudged so no point ever sits behind an open leaf.
	const hook = def.kind === "hook";
	const sample = (u: number, time: number, open: number, out: Vector3) => {
		curve.getPoint(u, out);
		const grow = smooth(0.25, 0.6, u) * (hook ? 0.5 : 1);
		out.y += Math.sin(u * 9 - time * 2.2 + def.phase) * 0.17 * grow;
		out.z += Math.cos(u * 7 - time * 1.7 + def.phase) * 0.1 * grow;
		keepInFrontOfLeaves(out, open);
		return out;
	};

	useFrame(({ clock }) => {
		const time = reduced ? STILL_MOMENT : clock.elapsedTime;
		const { reach, open } = timeline(time, reduced);
		const e = reach(def.delay);
		const visible = e > 0.01;
		if (tube.current) tube.current.visible = visible;
		if (hand.current) hand.current.visible = visible;
		if (!visible) return;

		const sway = Math.sin(time * 1.3 + def.phase) * 0.14;
		const drift = Math.sin(time * 0.9 + def.phase * 2) * 0.1;
		const s = def.side;
		const [p0, p1, p2, p3, p4] = curve.points;
		// Both kinds leave the void straight through the gap, clear of the
		// leaves' free edges (which sit at z ≈ 0.68 when fully open).
		p0.set(0, def.y, -0.3);
		p1.set(s * 0.04, def.y, 0.8);
		if (hook) {
			// Around the free edge, then back onto the leaf's front face.
			p2.set(s * 0.3, def.y + def.rise * 0.3, 1.02);
			p3.set(s * 0.52, def.y + def.rise * 0.7 + sway * 0.3, 0.78);
			p4.set(s * 0.7, def.y + def.rise, 0.52);
		} else {
			p2.set(s * 0.4, def.y + def.rise * 0.3, 1.28);
			p3.set(
				s * def.length * 0.62,
				def.y + def.rise * 0.7 + sway,
				1.38 + drift,
			);
			p4.set(s * def.length, def.y + def.rise - sway * 0.6, 1.2 + drift * 2);
		}

		const { p, q, t, n, b } = scratch;
		const pos = geometry.attributes.position.array as Float32Array;
		for (let i = 0; i <= SEGMENTS; i++) {
			const u = (i / SEGMENTS) * e;
			sample(u, time, open, p);
			sample(Math.min(1, u + 0.01), time, open, q);
			t.subVectors(q, p).normalize();
			n.crossVectors(t, UP);
			if (n.lengthSq() < 1e-4) n.set(1, 0, 0);
			n.normalize();
			b.crossVectors(n, t).normalize();
			const r = 0.058 + (0.026 - 0.058) * (i / SEGMENTS);
			for (let j = 0; j < RADIAL; j++) {
				const a = (j / RADIAL) * Math.PI * 2;
				const cos = Math.cos(a) * r;
				const sin = Math.sin(a) * r;
				const o = (i * RADIAL + j) * 3;
				pos[o] = p.x + n.x * cos + b.x * sin;
				pos[o + 1] = p.y + n.y * cos + b.y * sin;
				pos[o + 2] = p.z + n.z * cos + b.z * sin;
			}
		}
		geometry.attributes.position.needsUpdate = true;
		geometry.computeVertexNormals();
		geometry.computeBoundingSphere();

		if (hand.current) {
			sample(e, time, open, p);
			sample(Math.max(0, e - 0.02), time, open, q);
			t.subVectors(p, q).normalize();
			hand.current.position.copy(p);
			hand.current.quaternion.copy(scratch.quat.setFromUnitVectors(FORWARD, t));
			hand.current.scale.setScalar(smooth(0.08, 0.35, e));
		}
		if (fingers.current) {
			const curl = 0.35 + Math.sin(time * 2 + def.phase) * 0.3;
			for (const f of fingers.current.children) f.rotation.x = curl;
		}
	});

	return (
		<>
			<mesh ref={tube} geometry={geometry} castShadow>
				<meshStandardMaterial
					color={color}
					roughness={0.85}
					clippingPlanes={FLOOR_CLIP}
				/>
			</mesh>
			<group ref={hand}>
				<mesh scale={[1.2, 0.55, 1.25]} castShadow>
					<sphereGeometry args={[0.085, 16, 12]} />
					<meshStandardMaterial
						color={color}
						roughness={0.85}
						clippingPlanes={FLOOR_CLIP}
					/>
				</mesh>
				<group ref={fingers}>
					{[-0.06, -0.02, 0.02, 0.06, -0.09].map((x, i) => (
						<group
							key={x}
							position={[x, 0, 0.07]}
							rotation={[0, i === 4 ? -0.9 : x * 4, 0]}
						>
							<mesh position={[0, 0, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
								<capsuleGeometry args={[0.019, i === 4 ? 0.07 : 0.11, 4, 8]} />
								<meshStandardMaterial
									color={color}
									roughness={0.85}
									clippingPlanes={FLOOR_CLIP}
								/>
							</mesh>
						</group>
					))}
				</group>
			</group>
		</>
	);
}

function Door({
	side,
	reduced,
	palette,
	map,
	bumpMap,
}: {
	side: 1 | -1;
	reduced: boolean;
	palette: Palette;
	map: Texture;
	bumpMap: Texture;
}) {
	const hinge = useRef<Group>(null);
	const [faceMap, faceBump] = useMemo(() => {
		const half = (src: Texture) => {
			const t = src.clone();
			t.repeat.set(0.5, 1);
			t.offset.set(side === -1 ? 0 : 0.5, 0);
			t.needsUpdate = true;
			return t;
		};
		return [half(map), half(bumpMap)];
	}, [map, bumpMap, side]);

	useFrame(({ clock }) => {
		const { open } = timeline(clock.elapsedTime, reduced);
		if (hinge.current) hinge.current.rotation.y = side * open * OPEN_ANGLE;
	});

	return (
		<group ref={hinge} position={[side * DOOR_W, DOOR_Y, 0]}>
			<mesh position={[-side * (DOOR_W / 2), 0, 0]} castShadow receiveShadow>
				<boxGeometry args={[DOOR_W, DOOR_H, 0.14]} />
				{/* box faces: +x, -x, +y, -y, +z (front), -z */}
				<meshStandardMaterial
					attach="material-0"
					color={palette.stone}
					roughness={0.9}
					clippingPlanes={FLOOR_CLIP}
				/>
				<meshStandardMaterial
					attach="material-1"
					color={palette.stone}
					roughness={0.9}
					clippingPlanes={FLOOR_CLIP}
				/>
				<meshStandardMaterial
					attach="material-2"
					color={palette.stone}
					roughness={0.9}
					clippingPlanes={FLOOR_CLIP}
				/>
				<meshStandardMaterial
					attach="material-3"
					color={palette.stone}
					roughness={0.9}
					clippingPlanes={FLOOR_CLIP}
				/>
				<meshStandardMaterial
					attach="material-4"
					map={faceMap}
					bumpMap={faceBump}
					bumpScale={2.5}
					roughness={0.88}
					clippingPlanes={FLOOR_CLIP}
				/>
				<meshStandardMaterial
					attach="material-5"
					color={palette.stone}
					roughness={0.9}
					clippingPlanes={FLOOR_CLIP}
				/>
			</mesh>
		</group>
	);
}

function Eye({ reduced }: { reduced: boolean }) {
	const lid = useRef<Group>(null);
	useFrame(({ clock }) => {
		if (lid.current)
			lid.current.scale.y = Math.max(
				0.05,
				timeline(clock.elapsedTime, reduced).blink,
			);
	});
	return (
		<group ref={lid} position={[0, 1.75, -0.12]}>
			<mesh scale={[0.3, 0.13, 0.04]}>
				<sphereGeometry args={[1, 32, 16]} />
				<meshBasicMaterial color="#ffffff" clippingPlanes={FLOOR_CLIP} />
			</mesh>
			<mesh position={[0, 0, 0.03]} scale={[0.1, 0.1, 0.02]}>
				<sphereGeometry args={[1, 24, 16]} />
				<meshBasicMaterial color="#050505" clippingPlanes={FLOOR_CLIP} />
			</mesh>
			<mesh position={[0.03, 0.035, 0.05]} scale={[0.022, 0.022, 0.01]}>
				<sphereGeometry args={[1, 12, 8]} />
				<meshBasicMaterial color="#ffffff" clippingPlanes={FLOOR_CLIP} />
			</mesh>
		</group>
	);
}

function Gate({ palette, reduced }: { palette: Palette; reduced: boolean }) {
	const root = useRef<Group>(null);
	const { map, bumpMap } = useMemo(() => makeDoorTextures(palette), [palette]);

	useFrame(({ clock }) => {
		const { rise } = timeline(clock.elapsedTime, reduced);
		if (root.current) root.current.position.y = -3.7 * (1 - rise);
	});

	const stone = (
		<meshStandardMaterial
			color={palette.stone}
			roughness={0.9}
			clippingPlanes={FLOOR_CLIP}
		/>
	);
	return (
		<group ref={root}>
			{/* frame */}
			<mesh position={[0, 0.06, 0]} castShadow receiveShadow>
				<boxGeometry args={[2.9, 0.12, 0.7]} />
				{stone}
			</mesh>
			{[-1, 1].map((s) => (
				<mesh key={s} position={[s * 1.14, DOOR_Y, 0]} castShadow receiveShadow>
					<boxGeometry args={[0.28, DOOR_H, 0.42]} />
					{stone}
				</mesh>
			))}
			<mesh position={[0, 0.12 + DOOR_H + 0.18, 0]} castShadow receiveShadow>
				<boxGeometry args={[2.6, 0.36, 0.46]} />
				{stone}
			</mesh>
			<mesh position={[0, 0.12 + DOOR_H + 0.4, 0]} castShadow>
				<boxGeometry args={[2.8, 0.08, 0.5]} />
				{stone}
			</mesh>

			{/* the void behind the doors */}
			<mesh position={[0, DOOR_Y, -0.16]}>
				<planeGeometry args={[2 * DOOR_W, DOOR_H]} />
				<meshBasicMaterial color="#050505" clippingPlanes={FLOOR_CLIP} />
			</mesh>
			<Eye reduced={reduced} />

			<Door
				side={-1}
				reduced={reduced}
				palette={palette}
				map={map}
				bumpMap={bumpMap}
			/>
			<Door
				side={1}
				reduced={reduced}
				palette={palette}
				map={map}
				bumpMap={bumpMap}
			/>

			{ARMS.map((def) => (
				<Arm
					key={`${def.y}-${def.side}`}
					def={def}
					color={palette.arms}
					reduced={reduced}
				/>
			))}
		</group>
	);
}

function PhilosophersStone({ reduced }: { reduced: boolean }) {
	const mesh = useRef<Mesh>(null);
	useFrame(({ clock }) => {
		const t = clock.elapsedTime;
		if (!mesh.current) return;
		if (!reduced) {
			mesh.current.rotation.y = t * 0.6;
			mesh.current.position.y = 0.34 + Math.sin(t * 1.4) * 0.05;
		}
		const mat = mesh.current.material as MeshStandardMaterial;
		mat.emissiveIntensity = 0.55 + Math.sin(t * 2.2) * 0.25;
	});
	return (
		<group position={[0, 0, 1.6]}>
			<mesh ref={mesh} position={[0, 0.34, 0]} scale={[1, 1.35, 1]} castShadow>
				<octahedronGeometry args={[0.17, 0]} />
				<meshStandardMaterial
					color="#b5121b"
					emissive="#8a0b12"
					roughness={0.25}
					metalness={0.1}
					flatShading
				/>
			</mesh>
			<pointLight
				position={[0, 0.4, 0.2]}
				color="#e0262f"
				intensity={1.4}
				distance={2.5}
			/>
		</group>
	);
}

function Floor({ palette, reduced }: { palette: Palette; reduced: boolean }) {
	const map = useMemo(() => makeCircleTexture(palette), [palette]);
	const mat = useRef<MeshStandardMaterial>(null);
	useFrame(({ clock }) => {
		if (mat.current)
			mat.current.opacity = reduced ? 1 : smooth(0, 1.4, clock.elapsedTime);
	});
	return (
		<>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
				<planeGeometry args={[6.4, 6.4]} />
				<meshStandardMaterial
					ref={mat}
					map={map}
					transparent
					depthWrite={false}
					roughness={1}
				/>
			</mesh>
			<mesh
				rotation={[-Math.PI / 2, 0, 0]}
				position={[0, 0.002, 0]}
				receiveShadow
			>
				<planeGeometry args={[14, 14]} />
				<shadowMaterial opacity={palette === PALETTES.dark ? 0.5 : 0.14} />
			</mesh>
		</>
	);
}

const REACTION_BLUE = new Color("#3d8bff");
const REACTION_RED = new Color("#ff2b2b");
const BOLTS = 18;
const BOLT_SEGMENTS = 6;
// Radii of the circle's rings in world units (floor plane is 6.4 wide).
const RING_RADII = [3.12, 2.5, 1.3];

/**
 * The transmutation reaction: the circle's lines flare red and blue,
 * lightning crawls over the rings and coloured light washes the stone.
 */
function Reaction({ palette, dark }: { palette: Palette; dark: boolean }) {
	const glowMap = useMemo(
		() =>
			makeCircleTexture({ ...palette, ink: "#ffffff", bg: "rgba(0,0,0,0)" }),
		[palette],
	);
	const glow = useRef<MeshBasicMaterial>(null);
	const bolts = useRef<LineSegments>(null);
	const blue = useRef<PointLight>(null);
	const red = useRef<PointLight>(null);
	const lastBolt = useRef(0);
	const tint = useMemo(() => new Color(), []);

	const geometry = useMemo(() => {
		const g = new BufferGeometry();
		const count = BOLTS * BOLT_SEGMENTS * 2;
		g.setAttribute(
			"position",
			new BufferAttribute(new Float32Array(count * 3), 3),
		);
		g.setAttribute(
			"color",
			new BufferAttribute(new Float32Array(count * 3), 3),
		);
		return g;
	}, []);

	useFrame(({ clock }) => {
		const time = clock.elapsedTime;
		const { flare } = timeline(time, false);
		const flicker = 0.75 + Math.random() * 0.25;

		if (glow.current) {
			tint
				.copy(REACTION_BLUE)
				.lerp(REACTION_RED, 0.5 + 0.5 * Math.sin(time * 5));
			glow.current.color.copy(tint);
			glow.current.opacity = flare * flicker;
		}
		if (blue.current && red.current) {
			const a = time * 1.6;
			blue.current.position.set(Math.cos(a) * 2.2, 0.5, Math.sin(a) * 2.2);
			red.current.position.set(-Math.cos(a) * 2.2, 0.5, -Math.sin(a) * 2.2);
			blue.current.intensity = flare * 28 * flicker;
			red.current.intensity = flare * 28 * (1.75 - flicker);
		}

		const lines = bolts.current;
		if (!lines) return;
		lines.visible = flare > 0.02;
		(lines.material as LineBasicMaterial).opacity = flare;
		if (!lines.visible || time - lastBolt.current < 0.05) return;
		lastBolt.current = time;

		// Fresh jagged arcs every few frames, crawling along and up from the rings.
		const pos = geometry.attributes.position.array as Float32Array;
		const col = geometry.attributes.color.array as Float32Array;
		let v = 0;
		for (let i = 0; i < BOLTS; i++) {
			const c = Math.random() < 0.5 ? REACTION_BLUE : REACTION_RED;
			let angle = Math.random() * Math.PI * 2;
			let radius = RING_RADII[i % RING_RADII.length];
			let y = 0.02;
			let px = Math.cos(angle) * radius;
			let pz = Math.sin(angle) * radius;
			for (let s = 0; s < BOLT_SEGMENTS; s++) {
				angle += (Math.random() - 0.3) * 0.16;
				radius += (Math.random() - 0.5) * 0.22;
				y += Math.random() * 0.32 * flare;
				const nx = Math.cos(angle) * radius;
				const nz = Math.sin(angle) * radius;
				pos.set([px, y * 0.6, pz, nx, y, nz], v * 3);
				col.set([c.r, c.g, c.b, c.r, c.g, c.b], v * 3);
				v += 2;
				px = nx;
				pz = nz;
			}
		}
		geometry.attributes.position.needsUpdate = true;
		geometry.attributes.color.needsUpdate = true;
		geometry.computeBoundingSphere();
	});

	// On white, additive light vanishes: draw the reaction as coloured ink.
	const blending = dark ? AdditiveBlending : NormalBlending;
	return (
		<>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
				<planeGeometry args={[6.4, 6.4]} />
				<meshBasicMaterial
					ref={glow}
					map={glowMap}
					transparent
					opacity={0}
					depthWrite={false}
					blending={blending}
					toneMapped={false}
				/>
			</mesh>
			<lineSegments ref={bolts} geometry={geometry} visible={false}>
				<lineBasicMaterial
					vertexColors
					transparent
					depthWrite={false}
					blending={blending}
					toneMapped={false}
				/>
			</lineSegments>
			<pointLight ref={blue} color={REACTION_BLUE} intensity={0} distance={7} />
			<pointLight ref={red} color={REACTION_RED} intensity={0} distance={7} />
		</>
	);
}

const CAMERA_DISTANCE = 11.5;

/** Orbits around the gate: a fixed `orbit` angle plus a gentle pointer tilt. */
function CameraRig({ reduced, orbit }: { reduced: boolean; orbit: number }) {
	const { camera, pointer } = useThree();
	useFrame(() => {
		const a = (orbit * Math.PI) / 180 + (reduced ? 0 : pointer.x * 0.08);
		const ty = 3 + (reduced ? 0 : pointer.y * 0.4);
		const ease = reduced ? 1 : 0.04;
		camera.position.x +=
			(Math.sin(a) * CAMERA_DISTANCE - camera.position.x) * ease;
		camera.position.y += (ty - camera.position.y) * ease;
		camera.position.z +=
			(Math.cos(a) * CAMERA_DISTANCE - camera.position.z) * ease;
		camera.lookAt(0, 1.55, 0);
	});
	return null;
}

function usePrefersReducedMotion() {
	const [reduced, setReduced] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReduced(mq.matches);
		const onChange = () => setReduced(mq.matches);
		mq.addEventListener("change", onChange);
		return () => mq.removeEventListener("change", onChange);
	}, []);
	return reduced;
}

/** Stops rendering while the scene is scrolled out of view. */
function useOnScreen() {
	const ref = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(true);
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(([entry]) =>
			setVisible(entry.isIntersecting),
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	return { ref, visible };
}

export default function GateScene({
	className,
	orbit = 0,
}: {
	className?: string;
	/** Camera angle around the gate in degrees (0 = frontal). */
	orbit?: number;
}) {
	const [theme] = useTheme();
	const palette = theme === Theme.DARK ? PALETTES.dark : PALETTES.light;
	const reduced = usePrefersReducedMotion();
	const onScreen = useOnScreen();

	return (
		<div ref={onScreen.ref} className={className} aria-hidden="true">
			<Canvas
				shadows
				dpr={[1, 1.75]}
				frameloop={reduced ? "demand" : onScreen.visible ? "always" : "never"}
				camera={{ position: [0, 3, 11.5], fov: 30, near: 0.1, far: 60 }}
				gl={{ alpha: true, antialias: true }}
				onCreated={({ gl }) => {
					gl.localClippingEnabled = true;
				}}
			>
				<ambientLight intensity={palette === PALETTES.dark ? 0.55 : 0.75} />
				<hemisphereLight args={["#ffffff", "#888888", 0.5]} />
				<directionalLight
					position={[3.5, 7, 6]}
					intensity={palette === PALETTES.dark ? 1.4 : 1.8}
					castShadow
					shadow-mapSize={[2048, 2048]}
					shadow-camera-left={-5}
					shadow-camera-right={5}
					shadow-camera-top={6}
					shadow-camera-bottom={-3}
				/>
				<directionalLight position={[-4, 3, -4]} intensity={0.6} />
				<Floor palette={palette} reduced={reduced} />
				{!reduced && (
					<Reaction palette={palette} dark={palette === PALETTES.dark} />
				)}
				<Gate palette={palette} reduced={reduced} />
				<PhilosophersStone reduced={reduced} />
				<CameraRig reduced={reduced} orbit={orbit} />
			</Canvas>
		</div>
	);
}
