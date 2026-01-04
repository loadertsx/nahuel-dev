import { ArrowLeft } from "lucide-react";
import { data, Link, useNavigate } from "react-router";
import { MarkdownView } from "~/components/markdown";
import database from "~/db";
import { markdownParser } from "~/utils/md.server";
import type { Route } from "../_.notes.$slug/+types/route";
import { getNote, getRelatedNotes } from "./queries.server";

export async function loader({ params, context }: Route.LoaderArgs) {
	const db = database(context.cloudflare.env.BLOG_DB);
	const note = await getNote(db, params.slug);
	if (!note) {
		throw new Response("Not Found", { status: 404 });
	}

	const content = note.content && markdownParser(note.content);
	const title = note.title;
	const relatedNotes = await getRelatedNotes(db, params.slug);

	return data({ note, relatedNotes, content, title });
}

export const meta = ({ data }: Route.MetaArgs) => {
	return [
		{ title: data?.title || "Loadertsx" },
		{ name: "description", content: `${data?.title}` },
	];
};

export default function NoteId({ loaderData }: Route.ComponentProps) {
	const { relatedNotes, content } = loaderData;
	const navigate = useNavigate();

	return (
		<div>
			<div className="lg:min-w-[800px] lg:max-w-[800px] mx-auto prose prose-md lg:prose-lg">
				<button
					type="button"
					className="flex mb-10 dark:text-white items-center font-bold gap-2 z-0 transition-transform transform hover:-translate-x-1 focus:outline-none cursor-pointer"
					onClick={() => {
						navigate("/notes");
					}}
				>
					<ArrowLeft />
					<span className="mb-[1px]">Back to Notes</span>
				</button>
				{content && <MarkdownView content={content} />}
				{relatedNotes.length > 0 && (
					<div>
						<h2 className="text-2xl font-bold">Related Notes</h2>
						<ul>
							{relatedNotes.map((note) => (
								<li key={note.relatedNoteId}>
									<Link to={`/notes/${note.relatedNoteId}`}>{note.title}</Link>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}
