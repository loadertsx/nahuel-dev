import { data } from "react-router";
import { NoteForm } from "~/components/admin/NoteForm";
import database from "~/db";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import { getTopics } from "~/lib/queries/topics.server";
import { noteSchema } from "~/lib/schemas/note";
import type { Route } from "./+types/route";
import {
	getAllNotesForSelection,
	getNote,
	getRelatedNoteIds,
	syncNote,
} from "../admin.notes.$noteId/queries.server";

export async function loader({ request, context, params }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const db = database(context.cloudflare.env.BLOG_DB);

	const [note, relatedNoteIds, topics, allNotes] = await Promise.all([
		getNote(db, params.noteId),
		getRelatedNoteIds(db, params.noteId),
		getTopics(db),
		getAllNotesForSelection(db, params.noteId),
	]);

	if (!note) {
		throw new Response("Note not found", { status: 404 });
	}

	return data({
		note: {
			...note,
			relatedNoteIds,
		},
		topics,
		allNotes,
	});
}

export async function action({ request, context, params }: Route.ActionArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const formData = await request.formData();

	const intent = formData.get("intent");
	if (intent !== "sync") {
		return data({ error: "Invalid intent" }, { status: 400 });
	}

	const title = formData.get("title") as string;
	const topicId = formData.get("topicId") as string;
	const content = formData.get("content") as string;
	const status = formData.get("status") as string;
	const clientUpdatedAtRaw = formData.get("clientUpdatedAt") as string;
	const relatedNoteIdsRaw = formData.get("relatedNoteIds") as string;

	const result = noteSchema.safeParse({ title, topicId, content, status });
	if (!result.success) {
		const fieldErrors = result.error.flatten().fieldErrors;
		return data({ error: "Validation failed", fieldErrors }, { status: 400 });
	}

	const clientUpdatedAt = Number(clientUpdatedAtRaw);
	if (Number.isNaN(clientUpdatedAt)) {
		return data({ error: "Invalid clientUpdatedAt" }, { status: 400 });
	}

	let relatedNoteIds: string[] | undefined;
	try {
		relatedNoteIds = JSON.parse(relatedNoteIdsRaw || "[]");
	} catch {
		relatedNoteIds = undefined;
	}

	const db = database(context.cloudflare.env.BLOG_DB);
	const syncResult = await syncNote(
		db,
		params.noteId,
		{
			title: result.data.title,
			topicId: result.data.topicId,
			content: result.data.content,
			status: result.data.status,
		},
		clientUpdatedAt,
		relatedNoteIds,
	);

	return data(syncResult);
}

export default function EditNote({ loaderData }: Route.ComponentProps) {
	const { note, topics, allNotes } = loaderData;

	return (
		<NoteForm
			mode="edit"
			noteId={note.id}
			initialData={note}
			topics={topics}
			allNotes={allNotes}
		/>
	);
}
