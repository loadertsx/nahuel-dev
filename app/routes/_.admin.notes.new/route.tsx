import { eq } from "drizzle-orm";
import { data } from "react-router";
import { NoteForm } from "~/components/admin/NoteForm";
import database from "~/db";
import { notes } from "~/db/schemas/notes";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import { getTopics } from "~/lib/queries/topics.server";
import { noteSchema } from "~/lib/schemas/note";
import type { Route } from "./+types/route";
import {
	getAllNotesForSelection,
	updateNoteRelations,
} from "../admin.notes.$noteId/queries.server";

export async function loader({ request, context }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const db = database(context.cloudflare.env.BLOG_DB);

	const [topics, allNotes] = await Promise.all([
		getTopics(db),
		getAllNotesForSelection(db),
	]);

	return data({ topics, allNotes });
}

export async function action({ request, context }: Route.ActionArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const formData = await request.formData();

	const intent = formData.get("intent");
	if (intent !== "create") {
		return data({ error: "Invalid intent" }, { status: 400 });
	}

	const title = formData.get("title") as string;
	const topicId = formData.get("topicId") as string;
	const content = formData.get("content") as string;
	const status = formData.get("status") as string;
	const relatedNoteIdsRaw = formData.get("relatedNoteIds") as string;

	const result = noteSchema.safeParse({ title, topicId, content, status });
	if (!result.success) {
		const fieldErrors = result.error.flatten().fieldErrors;
		return data({ error: "Validation failed", fieldErrors }, { status: 400 });
	}

	const db = database(context.cloudflare.env.BLOG_DB);
	const noteId = crypto.randomUUID();

	// Insert the note
	await db.insert(notes).values({
		id: noteId,
		title: result.data.title,
		topicId: result.data.topicId,
		content: result.data.content,
		status: result.data.status,
	});

	// Handle related notes
	let relatedNoteIds: string[] = [];
	try {
		relatedNoteIds = JSON.parse(relatedNoteIdsRaw || "[]");
	} catch {
		relatedNoteIds = [];
	}

	if (relatedNoteIds.length > 0) {
		await updateNoteRelations(db, noteId, relatedNoteIds);
	}

	// Return the created note for sync confirmation
	const createdNote = await db
		.select()
		.from(notes)
		.where(eq(notes.id, noteId))
		.get();

	return data({
		success: true,
		note: {
			id: noteId,
			title: result.data.title,
			content: result.data.content,
			topicId: result.data.topicId,
			status: result.data.status,
			createdAt: createdNote?.createdAt ?? new Date().toISOString(),
			updatedAt: createdNote?.updatedAt ?? new Date().toISOString(),
			relatedNoteIds,
		},
	});
}

export default function NewNote({ loaderData }: Route.ComponentProps) {
	const { topics, allNotes } = loaderData;

	return (
		<NoteForm mode="create" noteId="new" topics={topics} allNotes={allNotes} />
	);
}
