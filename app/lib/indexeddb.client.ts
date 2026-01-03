import Dexie, { type Table } from "dexie";

/**
 * NoteDraft represents a local draft stored in IndexedDB.
 * Contains all editable fields plus sync metadata.
 */
export interface NoteDraft {
	id: string;
	title: string;
	content: string;
	topicId: string;
	status: "draft" | "published";
	relatedNoteIds: string[];
	updatedAt: number;
	syncStatus: "synced" | "pending";
	serverUpdatedAt: number | null;
	isNew?: boolean;
}

/**
 * Server note shape (matches the Drizzle schema output)
 */
export interface ServerNote {
	id: string;
	title: string;
	content: string | null;
	topicId: string;
	status: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Extended server note with relations (from loader)
 */
export interface ServerNoteWithRelations extends ServerNote {
	relatedNoteIds: string[];
}

/**
 * Dexie database for notes admin
 */
export class NotesDatabase extends Dexie {
	drafts!: Table<NoteDraft, string>;

	constructor() {
		super("notes-admin-db");
		this.version(1).stores({
			drafts: "id, syncStatus, updatedAt",
		});
	}
}

// Singleton database instance
export const db = new NotesDatabase();

/**
 * Check if we're in browser environment
 */
export function isClient(): boolean {
	return typeof window !== "undefined";
}

/**
 * Get draft by ID from IndexedDB
 */
export async function getDraft(id: string): Promise<NoteDraft | undefined> {
	if (!isClient()) return undefined;
	try {
		return await db.drafts.get(id);
	} catch (error) {
		console.error("[IndexedDB] Failed to get draft:", error);
		return undefined;
	}
}

/**
 * Save or update draft in IndexedDB
 */
export async function saveDraft(draft: NoteDraft): Promise<void> {
	if (!isClient()) return;
	try {
		await db.drafts.put(draft);
	} catch (error) {
		console.error("[IndexedDB] Failed to save draft:", error);
	}
}

/**
 * Delete draft from IndexedDB
 */
export async function deleteDraft(id: string): Promise<void> {
	if (!isClient()) return;
	try {
		await db.drafts.delete(id);
	} catch (error) {
		console.error("[IndexedDB] Failed to delete draft:", error);
	}
}

/**
 * Get all drafts with pending sync status
 */
export async function getPendingDrafts(): Promise<NoteDraft[]> {
	if (!isClient()) return [];
	try {
		return await db.drafts.where("syncStatus").equals("pending").toArray();
	} catch (error) {
		console.error("[IndexedDB] Failed to get pending drafts:", error);
		return [];
	}
}
