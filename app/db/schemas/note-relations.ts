import { primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { notes } from "./notes";

export const noteRelations = sqliteTable(
	"note_relations",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => notes.id, { onDelete: "cascade" }),
		relatedNoteId: text("related_note_id")
			.notNull()
			.references(() => notes.id, { onDelete: "cascade" }),
	},
	(table) => {
		return {
			pk: primaryKey({ columns: [table.noteId, table.relatedNoteId] }),
		};
	},
);
