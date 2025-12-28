import { eq } from "drizzle-orm";
import type { Database } from "~/db";
import { post } from "~/db/schemas/post";

export async function getBlogPost(slug: string, db: Database) {
	return await db
		.select({
			tags: post.tags,
			content: post.content,
			title: post.title,
		})
		.from(post)
		.where(eq(post.id, String(slug)))
		.all();
}
