import { sql } from "drizzle-orm";
import type { Database } from "~/db";
import { post } from "~/db/schemas/post";

export async function getAllBlogs(db: Database) {
	return await db
		.select({
			date: post.date,
			id: post.id,
			title: post.title,
			tags: post.tags,
		})
		.from(post)
		.orderBy(
			sql`substr(${post.date}, 7, 2) || '-' || substr(${post.date}, 4, 2) || '-' || substr(${post.date}, 1, 2) DESC`,
		)
		.all();
}
