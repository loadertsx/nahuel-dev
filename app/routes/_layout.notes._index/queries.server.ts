import { and, desc, eq } from "drizzle-orm";
import type { Database } from "~/db";
import { notes } from "~/db/schemas/notes";
import { topics } from "~/db/schemas/topics";

export async function getTopics(db: Database) {
	return await db
		.select({
			title: topics.name,
			id: topics.id,
		})
		.from(topics)
		.all();
}

export async function getNotes(db: Database, topicId: string) {
	return await db
		.select({
			title: notes.title,
			id: notes.id,
		})
		.from(notes)
		.where(and(eq(notes.topicId, topicId), eq(notes.status, "published")))
		.orderBy(desc(notes.createdAt))
		.all();
}
