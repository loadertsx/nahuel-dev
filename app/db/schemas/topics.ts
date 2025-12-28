import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const topics = sqliteTable("topics", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	// biome-ignore lint/suspicious/noExplicitAny: drizzle self-reference pattern
	parentId: text("parent_id").references((): any => topics.id, {
		onDelete: "set null",
	}),
	createdAt: text("created_at").notNull().default(sql`(current_timestamp)`),
	updatedAt: text("updated_at").notNull().default(sql`(current_timestamp)`),
});
