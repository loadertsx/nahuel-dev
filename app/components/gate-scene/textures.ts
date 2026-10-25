import { CanvasTexture, SRGBColorSpace } from "three";

export type Palette = {
	stone: string;
	ink: string;
	arms: string;
	bg: string;
};

export const PALETTES: Record<"light" | "dark", Palette> = {
	light: { stone: "#f1efea", ink: "#0a0a0a", arms: "#0a0a0a", bg: "#ffffff" },
	dark: { stone: "#1b1b1b", ink: "#f2f2f2", arms: "#f5f5f5", bg: "#0a0a0a" },
};

const PLANETS = ["☉", "☿", "♀", "☽", "♂", "♃"];
const SCRIPT =
	"Quod est inferius est sicut quod est superius · solve et coagula · ex uno omnia · materia prima · separabis terram ab igne · ";

function canvas(width: number, height: number) {
	const c = document.createElement("canvas");
	c.width = width;
	c.height = height;
	const ctx = c.getContext("2d");
	if (!ctx) throw new Error("2D canvas not available");
	return { c, ctx };
}

function textOnCircle(
	ctx: CanvasRenderingContext2D,
	text: string,
	cx: number,
	cy: number,
	r: number,
) {
	const step = (Math.PI * 2) / text.length;
	for (let i = 0; i < text.length; i++) {
		const a = -Math.PI / 2 + i * step;
		ctx.save();
		ctx.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
		ctx.rotate(a + Math.PI / 2);
		ctx.fillText(text[i], 0, 0);
		ctx.restore();
	}
}

/** Engraved transmutation circle, drawn on a transparent floor texture. */
export function makeCircleTexture(p: Palette) {
	const S = 2048;
	const { c, ctx } = canvas(S, S);
	const C = S / 2;
	ctx.strokeStyle = p.ink;
	ctx.fillStyle = p.ink;
	ctx.lineCap = "round";

	const ring = (r: number, w: number) => {
		ctx.lineWidth = w;
		ctx.beginPath();
		ctx.arc(C, C, r, 0, Math.PI * 2);
		ctx.stroke();
	};
	ring(1000, 10);
	ring(960, 4);
	ring(800, 6);
	ring(420, 5);
	ring(150, 4);

	for (let i = 0; i < 96; i++) {
		const a = (i / 96) * Math.PI * 2;
		const outer = i % 8 === 0 ? 998 : 984;
		ctx.lineWidth = 3;
		ctx.beginPath();
		ctx.moveTo(C + Math.cos(a) * 962, C + Math.sin(a) * 962);
		ctx.lineTo(C + Math.cos(a) * outer, C + Math.sin(a) * outer);
		ctx.stroke();
	}

	ctx.font = "italic 46px Georgia, 'Times New Roman', serif";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	textOnCircle(ctx, SCRIPT + SCRIPT, C, C, 880);
	ctx.font = "italic 34px Georgia, 'Times New Roman', serif";
	textOnCircle(ctx, "nigredo · albedo · citrinitas · rubedo · ", C, C, 360);

	const hex = (off: number) => {
		ctx.lineWidth = 6;
		ctx.beginPath();
		for (let i = 0; i < 3; i++) {
			const a = off + (i * Math.PI * 2) / 3;
			const x = C + Math.cos(a) * 800;
			const y = C + Math.sin(a) * 800;
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.stroke();
	};
	hex(-Math.PI / 2);
	hex(Math.PI / 2);

	ctx.font = "64px 'Noto Sans Symbols', 'Segoe UI Symbol', serif";
	for (let i = 0; i < 6; i++) {
		const a = -Math.PI / 2 + (i * Math.PI) / 3;
		const x = C + Math.cos(a) * 800;
		const y = C + Math.sin(a) * 800;
		ctx.fillStyle = p.bg;
		ctx.beginPath();
		ctx.arc(x, y, 74, 0, Math.PI * 2);
		ctx.fill();
		ctx.lineWidth = 6;
		ctx.stroke();
		ctx.fillStyle = p.ink;
		ctx.fillText(PLANETS[i], x, y + 4);
	}

	const tex = new CanvasTexture(c);
	tex.colorSpace = SRGBColorSpace;
	tex.anisotropy = 8;
	return tex;
}

const TREE: Record<string, [number, number]> = {
	K: [0.5, 0.08],
	Ch: [0.78, 0.2],
	Bi: [0.22, 0.2],
	Che: [0.78, 0.42],
	Ge: [0.22, 0.42],
	Ti: [0.5, 0.53],
	Ne: [0.78, 0.72],
	Ho: [0.22, 0.72],
	Ye: [0.5, 0.82],
	Ma: [0.5, 0.93],
};
const PATHS =
	"K-Ch K-Bi K-Ti Ch-Bi Ch-Ti Bi-Ti Ch-Che Bi-Ge Che-Ge Che-Ti Ge-Ti Che-Ne Ge-Ho Ti-Ne Ti-Ho Ti-Ye Ne-Ho Ne-Ye Ho-Ye Ne-Ma Ho-Ma Ye-Ma".split(
		" ",
	);

/**
 * The Tree of Life carving spanning both doors. Returns a colour map and a
 * bump map; each door samples its half via texture offset/repeat.
 */
export function makeDoorTextures(p: Palette) {
	const W = 1024;
	const H = 1536;
	const draw = (ctx: CanvasRenderingContext2D, bg: string, ink: string) => {
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, W, H);
		ctx.strokeStyle = ink;
		ctx.globalAlpha = 0.22;
		ctx.lineWidth = 1.5;
		for (let x = 40; x < W - 40; x += 9) {
			ctx.beginPath();
			ctx.moveTo(x, 40);
			ctx.lineTo(x, H - 40);
			ctx.stroke();
		}
		ctx.globalAlpha = 1;
		ctx.lineWidth = 8;
		ctx.strokeRect(24, 24, W - 48, H - 48);
		ctx.lineWidth = 3;
		ctx.strokeRect(44, 44, W - 88, H - 88);
		ctx.lineWidth = 12;
		ctx.lineCap = "round";
		for (const e of PATHS) {
			const [a, b] = e.split("-").map((k) => TREE[k]);
			ctx.beginPath();
			ctx.moveTo(a[0] * W, a[1] * H);
			ctx.lineTo(b[0] * W, b[1] * H);
			ctx.stroke();
		}
		for (const [x, y] of Object.values(TREE)) {
			ctx.fillStyle = bg;
			ctx.beginPath();
			ctx.arc(x * W, y * H, 58, 0, Math.PI * 2);
			ctx.fill();
			ctx.lineWidth = 10;
			ctx.stroke();
			ctx.lineWidth = 4;
			ctx.beginPath();
			ctx.arc(x * W, y * H, 26, 0, Math.PI * 2);
			ctx.stroke();
			ctx.lineWidth = 12;
		}
	};

	const color = canvas(W, H);
	draw(color.ctx, p.stone, p.ink);
	const bump = canvas(W, H);
	draw(bump.ctx, "#ffffff", "#000000");

	const map = new CanvasTexture(color.c);
	map.colorSpace = SRGBColorSpace;
	map.anisotropy = 8;
	const bumpMap = new CanvasTexture(bump.c);
	return { map, bumpMap };
}
