import { eq, ne, or } from "drizzle-orm";
import type { Database } from "~/db";
import { noteRelations } from "~/db/schemas/note-relations";
import { notes } from "~/db/schemas/notes";
import { topics } from "~/db/schemas/topics";

export interface NoteUpdateData {
	title: string;
	topicId: string;
	content: string;
	status: "draft" | "published";
}

export interface SyncResponse {
	success: boolean;
	conflict?: boolean;
	note?: {
		id: string;
		title: string;
		content: string | null;
		topicId: string;
		status: string;
		createdAt: string;
		updatedAt: string;
		relatedNoteIds: string[];
	};
	error?: string;
}

const TZ_SUFFIX_REGEX = /(?:Z|[+-]\d{2}:\d{2})$/;

function parseServerTimestamp(serverTimestamp: string): number {
	if (!serverTimestamp) return Number.NaN;
	const trimmed = serverTimestamp.trim();
	if (trimmed.includes("T") || TZ_SUFFIX_REGEX.test(trimmed)) {
		return new Date(trimmed).getTime();
	}
	return new Date(`${trimmed.replace(" ", "T")}Z`).getTime();
}

/**
 * Get a single note with topic info
 */
export async function getNote(db: Database, noteId: string) {
	const result = await db
		.select({
			id: notes.id,
			title: notes.title,
			content: notes.content,
			topicId: notes.topicId,
			status: notes.status,
			createdAt: notes.createdAt,
			updatedAt: notes.updatedAt,
			topicName: topics.name,
		})
		.from(notes)
		.leftJoin(topics, eq(notes.topicId, topics.id))
		.where(eq(notes.id, noteId))
		.get();

	return result;
}

/**
 * Get related note IDs for a note
 * Relations are bidirectional, so check both columns
 */
export async function getRelatedNoteIds(
	db: Database,
	noteId: string,
): Promise<string[]> {
	const relations = await db
		.select({
			noteId: noteRelations.noteId,
			relatedNoteId: noteRelations.relatedNoteId,
		})
		.from(noteRelations)
		.where(
			or(
				eq(noteRelations.noteId, noteId),
				eq(noteRelations.relatedNoteId, noteId),
			),
		)
		.all();

	// Extract the "other" note ID from each relation
	const relatedIds = relations.map((r) =>
		r.noteId === noteId ? r.relatedNoteId : r.noteId,
	);

	return relatedIds;
}

/**
 * Get all notes for the relation picker (excluding a specific note)
 */
export async function getAllNotesForSelection(
	db: Database,
	excludeNoteId?: string,
) {
	const query = db
		.select({
			id: notes.id,
			title: notes.title,
		})
		.from(notes);

	if (excludeNoteId) {
		return await query.where(ne(notes.id, excludeNoteId)).all();
	}

	return await query.all();
}

/**
 * Update a note (manually set updatedAt since defaults only apply on INSERT)
 */
export async function updateNote(
	db: Database,
	noteId: string,
	data: NoteUpdateData,
) {
	const now = new Date().toISOString();

	await db
		.update(notes)
		.set({
			title: data.title,
			topicId: data.topicId,
			content: data.content,
			status: data.status,
			updatedAt: now,
		})
		.where(eq(notes.id, noteId));

	return await getNote(db, noteId);
}

/**
 * Create a new note (createdAt and updatedAt are set by DB default)
 */
export async function createNote(
	db: Database,
	noteId: string,
	data: NoteUpdateData,
) {
	await db.insert(notes).values({
		id: noteId,
		title: data.title,
		topicId: data.topicId,
		content: data.content,
		status: data.status,
	});

	return await getNote(db, noteId);
}

/**
 * Sync note with LWW (Last-Write-Wins) conflict resolution
 * Compares client timestamp with server timestamp
 */
export async function syncNote(
	db: Database,
	noteId: string,
	data: NoteUpdateData,
	clientUpdatedAt: number,
	relatedNoteIds?: string[],
): Promise<SyncResponse> {
	// Get current server state
	const serverNote = await getNote(db, noteId);

	if (!serverNote) {
		return {
			success: false,
			error: "Note not found",
		};
	}

	const serverUpdatedAt = parseServerTimestamp(serverNote.updatedAt);

	// LWW: Compare timestamps
	if (serverUpdatedAt > clientUpdatedAt) {
		// Server wins - return conflict with server data
		const relatedIds = await getRelatedNoteIds(db, noteId);
		return {
			success: true,
			conflict: true,
			note: {
				...serverNote,
				relatedNoteIds: relatedIds,
			},
		};
	}

	// Client wins - update server
	const updatedNote = await updateNote(db, noteId, data);

	if (!updatedNote) {
		return {
			success: false,
			error: "Failed to update note",
		};
	}

	// Update related notes if provided
	if (relatedNoteIds !== undefined) {
		await updateNoteRelations(db, noteId, relatedNoteIds);
	}

	const relatedIds = await getRelatedNoteIds(db, noteId);

	return {
		success: true,
		note: {
			...updatedNote,
			relatedNoteIds: relatedIds,
		},
	};
}

/**
 * Update note relations (delete existing, insert new)
 */
export async function updateNoteRelations(
	db: Database,
	noteId: string,
	relatedNoteIds: string[],
) {
	// Delete existing relations for this note
	await db
		.delete(noteRelations)
		.where(
			or(
				eq(noteRelations.noteId, noteId),
				eq(noteRelations.relatedNoteId, noteId),
			),
		);

	// Insert new relations
	if (relatedNoteIds.length > 0) {
		await db.insert(noteRelations).values(
			relatedNoteIds.map((relatedId) => ({
				noteId,
				relatedNoteId: relatedId,
			})),
		);
	}
}
