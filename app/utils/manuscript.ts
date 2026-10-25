const NUMERALS: [number, string][] = [
	[1000, "M"],
	[900, "CM"],
	[500, "D"],
	[400, "CD"],
	[100, "C"],
	[90, "XC"],
	[50, "L"],
	[40, "XL"],
	[10, "X"],
	[9, "IX"],
	[5, "V"],
	[4, "IV"],
	[1, "I"],
];

export function toRoman(n: number) {
	let out = "";
	let rest = n;
	for (const [value, symbol] of NUMERALS) {
		while (rest >= value) {
			out += symbol;
			rest -= value;
		}
	}
	return out;
}

const MONTHS = [
	"JAN",
	"FEB",
	"MAR",
	"APR",
	"MAY",
	"JUN",
	"JUL",
	"AUG",
	"SEP",
	"OCT",
	"NOV",
	"DEC",
];

/** "FEB MMXXV" */
export function manuscriptDate(date: Date) {
	return `${MONTHS[date.getMonth()]} ${toRoman(date.getFullYear())}`;
}

/** Blog dates are stored as dd/mm/yy. */
export function parseBlogDate(value: string | null): Date | null {
	if (!value) return null;
	const [day, month, year] = value.trim().split("/");
	if (!day || !month || !year) return null;
	const fullYear = year.length === 2 ? `20${year}` : year;
	const date = new Date(Number(fullYear), Number(month) - 1, Number(day));
	return Number.isNaN(date.getTime()) ? null : date;
}

/** Note timestamps are stored as "YYYY-MM-DD HH:MM:SS" (UTC). */
export function parseTimestamp(value: string | null): Date | null {
	if (!value) return null;
	const date = new Date(`${value.replace(" ", "T")}Z`);
	return Number.isNaN(date.getTime()) ? null : date;
}
