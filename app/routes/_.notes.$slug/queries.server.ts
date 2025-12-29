import { eq } from "drizzle-orm";
import type { Database } from "~/db";
import { noteRelations } from "~/db/schemas/note-relations";
import { notes } from "~/db/schemas/notes";

export async function getNote(db: Database, noteId: string) {
	return await db
		.select({
			title: notes.title,
			content: notes.content,
		})
		.from(notes)
		.where(eq(notes.id, noteId))
		.all();
}

export async function getRelatedNotes(db: Database, noteId: string) {
	return await db
		.select({
			relatedNoteId: noteRelations.relatedNoteId,
			title: notes.title,
		})
		.from(noteRelations)
		.innerJoin(notes, eq(noteRelations.relatedNoteId, notes.id))
		.where(eq(noteRelations.noteId, noteId))
		.all();
}
