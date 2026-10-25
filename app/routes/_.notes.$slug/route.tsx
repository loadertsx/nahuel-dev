import { data, Link } from "react-router";
import { IndexRow } from "~/components/alchemy/index-row";
import { Eyebrow, Ornament } from "~/components/alchemy/ornament";
import { SigilLink } from "~/components/alchemy/sigil-link";
import { MarkdownView } from "~/components/markdown";
import database from "~/db";
import { manuscriptDate, parseTimestamp, toRoman } from "~/utils/manuscript";
import { markdownParser } from "~/utils/md.server";
import type { Route } from "../_.notes.$slug/+types/route";
import { getNote, getRelatedNotes, getTopicNotes } from "./queries.server";

export const handle = { plate: "Plate VI · Folio" };

export async function loader({ params, context }: Route.LoaderArgs) {
	const db = database(context.cloudflare.env.BLOG_DB);
	const note = await getNote(db, params.slug);
	if (!note) {
		throw new Response("Not Found", { status: 404 });
	}

	const [relatedNotes, volume] = await Promise.all([
		getRelatedNotes(db, params.slug),
		getTopicNotes(db, note.topicId),
	]);
	const index = volume.findIndex((n) => n.id === params.slug);
	const date = parseTimestamp(note.createdAt);

	return data({
		title: note.title,
		content: note.content && markdownParser(note.content),
		volume: note.topicName,
		date: date ? manuscriptDate(date) : null,
		folio: index + 1,
		folios: volume.length,
		previous: volume[index - 1] ?? null,
		next: volume[index + 1] ?? null,
		relatedNotes,
	});
}

export const meta = ({ data }: Route.MetaArgs) => {
	return [
		{ title: data?.title || "Loadertsx" },
		{ name: "description", content: `${data?.title}` },
	];
};

function FolioCard({
	label,
	note,
	align,
}: {
	label: string;
	note: { id: string; title: string } | null;
	align: "start" | "end";
}) {
	const to = note ? `/notes/${note.id}` : "/notes";
	return (
		<Link
			to={to}
			viewTransition
			className={`group flex-1 flex flex-col gap-2.5 border border-[var(--ink)] px-[22px] py-5 ${align === "end" ? "md:items-end md:text-right" : ""}`}
		>
			<span className="caps text-[0.68rem] text-[var(--muted)] group-hover:text-[var(--ink)]">
				{label}
			</span>
			<span className="font-serif font-medium text-[1.5rem] md:text-[1.75rem] leading-[1.15] group-hover:italic">
				{note?.title ?? "All folios"}
			</span>
		</Link>
	);
}

export default function NoteId({ loaderData }: Route.ComponentProps) {
	const {
		title,
		content,
		volume,
		date,
		folio,
		folios,
		previous,
		next,
		relatedNotes,
	} = loaderData;

	return (
		<div className="max-w-[760px] pt-8 md:pt-14 pb-8 space-y-6">
			<SigilLink to="/notes">Back to the Grimoire</SigilLink>
			<Eyebrow fig="Volume" label={volume} />
			<h1 className="font-serif font-light display-plate leading-[0.92] tracking-[-0.02em]">
				{title}
			</h1>
			<p className="flex flex-wrap gap-x-3.5 gap-y-1 caps text-[0.68rem] text-[var(--muted)]">
				{date && <span>{date}</span>}
				<span aria-hidden="true">·</span>
				<span>
					Folio {toRoman(folio)} of {toRoman(folios)}
				</span>
			</p>

			<div className="folio border-t border-[var(--ink)] pt-8 md:pt-10">
				{content && <MarkdownView content={content} />}
			</div>

			{relatedNotes.length > 0 && (
				<section className="pt-6">
					<p className="caps text-[0.68rem] text-[var(--muted)] pb-3">
						Related folios
					</p>
					<div className="border-t border-[var(--ink)]">
						{relatedNotes.map((note) => (
							<IndexRow
								key={note.relatedNoteId}
								to={`/notes/${note.relatedNoteId}`}
								title={note.title}
							/>
						))}
					</div>
				</section>
			)}

			<Ornament className="pt-6 [&>span:first-child]:bg-[var(--rule)] [&>span:last-child]:bg-[var(--rule)]" />
			<nav className="flex flex-col md:flex-row gap-4">
				<FolioCard
					label={previous ? "Previous folio" : "The Grimoire"}
					note={previous}
					align="start"
				/>
				{next && <FolioCard label="Next folio" note={next} align="end" />}
			</nav>
		</div>
	);
}
