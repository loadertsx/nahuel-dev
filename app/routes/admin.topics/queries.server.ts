import { eq, sql } from "drizzle-orm";
import type { Database } from "~/db";
import { notes } from "~/db/schemas/notes";
import { topics } from "~/db/schemas/topics";

// Single query with LEFT JOIN to avoid N+1
export async function getTopicsWithNotesCount(db: Database) {
	return await db
		.select({
			id: topics.id,
			name: topics.name,
			createdAt: topics.createdAt,
			notesCount: sql<number>`count(${notes.id})`.as("notes_count"),
		})
		.from(topics)
		.leftJoin(notes, eq(notes.topicId, topics.id))
		.groupBy(topics.id)
		.all();
}

export async function deleteTopic(db: Database, topicId: string) {
	return await db.delete(topics).where(eq(topics.id, topicId));
}
