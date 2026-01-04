import { and, desc, eq } from "drizzle-orm";
import type { Database } from "~/db";
import { notes } from "~/db/schemas/notes";

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
