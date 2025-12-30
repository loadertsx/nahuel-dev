import { eq, sql } from "drizzle-orm";
import type { Database } from "~/db";
import { topics } from "~/db/schemas/topics";

export async function getTopic(db: Database, topicId: string) {
	return await db
		.select({
			id: topics.id,
			name: topics.name,
		})
		.from(topics)
		.where(eq(topics.id, topicId))
		.get();
}

export async function updateTopic(
	db: Database,
	topicId: string,
	name: string,
) {
	return await db
		.update(topics)
		.set({
			name,
			updatedAt: sql`(current_timestamp)`,
		})
		.where(eq(topics.id, topicId));
}
