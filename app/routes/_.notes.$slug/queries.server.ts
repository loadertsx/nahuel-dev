import { and, asc, eq } from "drizzle-orm";
import type { Database } from "~/db";
import { noteRelations } from "~/db/schemas/note-relations";
import { notes } from "~/db/schemas/notes";
import { topics } from "~/db/schemas/topics";

export async function getNote(db: Database, noteId: string) {
	return await db
		.select({
			title: notes.title,
			content: notes.content,
			createdAt: notes.createdAt,
			topicId: notes.topicId,
			topicName: topics.name,
		})
		.from(notes)
		.innerJoin(topics, eq(notes.topicId, topics.id))
		.where(and(eq(notes.id, noteId), eq(notes.status, "published")))
		.get();
}

/** Published notes of one topic in reading order (oldest first). */
export async function getTopicNotes(db: Database, topicId: string) {
	return await db
		.select({ id: notes.id, title: notes.title })
		.from(notes)
		.where(and(eq(notes.topicId, topicId), eq(notes.status, "published")))
		.orderBy(asc(notes.createdAt))
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
