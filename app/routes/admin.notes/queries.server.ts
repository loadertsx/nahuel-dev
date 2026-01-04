import { desc, eq, sql } from "drizzle-orm";
import type { Database } from "~/db";
import { notes } from "~/db/schemas/notes";
import { topics } from "~/db/schemas/topics";

// Get all notes with topic name and related notes count
export async function getAllNotesAdmin(db: Database) {
	return await db
		.select({
			id: notes.id,
			title: notes.title,
			status: notes.status,
			topicId: notes.topicId,
			topicName: topics.name,
			updatedAt: notes.updatedAt,
			relatedNotesCount: sql<number>`(
				SELECT count(*) FROM note_relations
				WHERE note_id = ${notes.id} OR related_note_id = ${notes.id}
			)`.as("related_notes_count"),
		})
		.from(notes)
		.leftJoin(topics, eq(notes.topicId, topics.id))
		.orderBy(desc(notes.updatedAt))
		.all();
}

// Delete note (cascade handles noteRelations cleanup)
export async function deleteNote(db: Database, noteId: string) {
	return await db.delete(notes).where(eq(notes.id, noteId));
}
