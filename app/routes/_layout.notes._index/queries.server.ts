import { and, desc, eq } from "drizzle-orm";
import type { Database } from "~/db";
import { notes } from "~/db/schemas/notes";

/** Published notes, newest first; all topics when `topicId` is empty. */
export async function getNotes(db: Database, topicId: string) {
	const published = eq(notes.status, "published");
	return await db
		.select({
			title: notes.title,
			id: notes.id,
			topicId: notes.topicId,
			createdAt: notes.createdAt,
		})
		.from(notes)
		.where(topicId ? and(eq(notes.topicId, topicId), published) : published)
		.orderBy(desc(notes.createdAt))
		.all();
}
