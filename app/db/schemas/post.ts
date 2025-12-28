import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const post = sqliteTable("post", {
	id: text("id"),
	content: text("content"),
	title: text("title"),
	date: text("date"),
	tags: text("tags"),
});
