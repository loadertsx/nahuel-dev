import { data, Link, useOutletContext } from "react-router";
import { twMerge } from "tailwind-merge";
import { Sigil } from "~/components/alchemy/glyphs";
import { IndexRow } from "~/components/alchemy/index-row";
import { PlateIntro } from "~/components/alchemy/ornament";
import database from "~/db";
import { manuscriptDate, parseTimestamp, toRoman } from "~/utils/manuscript";
import type { Route } from "./+types/route";
import { getNotes } from "./queries.server";

type OutletContext = {
	topics: Array<{ id: string; name: string }>;
};

export const handle = { plate: "Plate VI · The Grimoire" };

export async function loader({ context, request }: Route.LoaderArgs) {
	const url = new URL(request.url);
	const topic = url.searchParams.get("topic") ?? "";
	const db = database(context.cloudflare.env.BLOG_DB);
	const notes = await getNotes(db, topic);

	return data({ topic, notes });
}

export const meta: Route.MetaFunction = ({ matches }) => {
	const parentData = matches.find((m) => m?.id === "routes/_layout.notes")
		?.data as { topics: Array<{ name: string }> } | undefined;
	const topics = parentData?.topics || [];

	return [
		{ title: "Notes - Loadertsx" },
		{
			name: "description",
			content: topics.map((topic) => topic.name).join(", "),
		},
	];
};

function TopicTab({
	to,
	label,
	count,
	selected,
}: {
	to: string;
	label: string;
	count?: number;
	selected: boolean;
}) {
	return (
		<Link
			to={to}
			preventScrollReset
			aria-current={selected ? "page" : undefined}
			className={twMerge(
				"group inline-flex items-center gap-2.5 border px-3 py-2.5 pr-4 caps text-[0.68rem] leading-none transition-colors",
				selected
					? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
					: "border-[var(--rule-strong)] hover:border-[var(--ink)]",
			)}
			style={
				selected
					? ({
							"--sigil-ink": "var(--paper)",
							"--sigil-paper": "var(--ink)",
						} as React.CSSProperties)
					: undefined
			}
		>
			<Sigil size={13} active={selected} />
			{label}
			{count !== undefined && (
				<span
					className={twMerge(
						"font-serif italic normal-case tracking-normal text-[0.95rem]",
						selected ? "" : "text-[var(--muted)]",
					)}
				>
					{count}
				</span>
			)}
		</Link>
	);
}

export default function Notes({ loaderData }: Route.ComponentProps) {
	const { notes, topic } = loaderData;
	const { topics } = useOutletContext<OutletContext>();

	// Bind the notes into volumes, one per topic. Folios are numbered within
	// their volume, as on the folio page, so filtering never renumbers them.
	const volumes = topics
		.map((t, v) => ({
			...t,
			vol: v + 1,
			// Reading order inside a volume: oldest folio first.
			notes: notes
				.filter((note) => note.topicId === t.id)
				.reverse()
				.map((note, i) => ({ ...note, n: i + 1 })),
		}))
		.filter((v) => v.notes.length > 0);

	return (
		<section className="pb-8">
			<PlateIntro
				fig="Fig. VI"
				label="Knowledge Base"
				title="The"
				titleItalic="Grimoire."
				lede="Quick references and learnings, bound into volumes by topic."
				note="— what is learned is never lost"
			/>

			<nav
				aria-label="Topics"
				className="flex flex-wrap gap-2.5 pb-10 md:pb-14"
			>
				<TopicTab to="/notes" label="All" selected={!topic} />
				{topics.map((t) => (
					<TopicTab
						key={t.id}
						to={`/notes?topic=${t.id}`}
						label={t.name}
						selected={topic === t.id}
					/>
				))}
			</nav>

			<div className="space-y-10 md:space-y-14">
				{volumes.map((volume) => (
					<section
						key={volume.id}
						className="flex flex-col md:flex-row gap-2.5 md:gap-8"
					>
						<header className="md:w-[170px] xl:w-[260px] flex-none space-y-1.5 md:pt-4">
							<p className="caps text-[0.66rem] text-[var(--muted)]">
								Vol. {toRoman(volume.vol)} · {volume.notes.length}{" "}
								{volume.notes.length === 1 ? "folio" : "folios"}
							</p>
							<h2 className="font-serif font-light text-[2rem] xl:text-[2.15rem] leading-[1.05] tracking-normal">
								{volume.name}
							</h2>
						</header>
						<div className="flex-1 min-w-0 border-t border-[var(--ink)]">
							{volume.notes.map((note) => {
								const date = parseTimestamp(note.createdAt);
								return (
									<IndexRow
										key={note.id}
										to={`/notes/${note.id}`}
										numeral={toRoman(note.n)}
										title={note.title}
										date={date ? manuscriptDate(date) : null}
									/>
								);
							})}
						</div>
					</section>
				))}
				{volumes.length === 0 && (
					<p className="italic text-[var(--muted)]">
						This volume is still blank.
					</p>
				)}
			</div>
		</section>
	);
}
