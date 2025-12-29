import { drizzle } from "drizzle-orm/d1";
import { account, session, user, verification } from "./schemas/auth-schema";
import { noteRelations } from "./schemas/note-relations";
import { notes } from "./schemas/notes";
import { post } from "./schemas/post";
import { topics } from "./schemas/topics";

export type Database = ReturnType<typeof database>;

export default function database(d1: D1Database) {
	return drizzle(d1, {
		schema: {
			post,
			user,
			session,
			account,
			verification,
			notes,
			topics,
			noteRelations,
		},
	});
}
