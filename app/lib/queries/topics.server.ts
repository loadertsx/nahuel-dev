import type { Database } from "~/db";
import { topics } from "~/db/schemas/topics";

export async function getTopics(db: Database) {
	return await db
		.select({ id: topics.id, name: topics.name })
		.from(topics)
		.orderBy(topics.name)
		.all();
}
