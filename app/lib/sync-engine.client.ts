import type { NoteDraft, ServerNoteWithRelations } from "./indexeddb.client";

/**
 * Result of a sync operation
 */
export interface SyncResult {
	status: "synced" | "conflict-resolved" | "error" | "created";
	data?: NoteDraft;
	error?: string;
	serverUpdatedAt?: number;
}

/**
 * Conflict winner determination
 */
export type ConflictWinner = "local" | "server";

/**
 * Sync status for UI display
 */
export type SyncStatus = "synced" | "pending" | "syncing" | "error" | "offline";

/**
 * Server sync response shape
 */
export interface SyncResponse {
	success: boolean;
	conflict?: boolean;
	note?: ServerNoteWithRelations;
	updatedAt?: string;
	error?: string;
}

const TZ_SUFFIX_REGEX = /(?:Z|[+-]\d{2}:\d{2})$/;

export function parseServerTimestamp(serverTimestamp: string): number {
	if (!serverTimestamp) return Number.NaN;
	const trimmed = serverTimestamp.trim();
	if (trimmed.includes("T") || TZ_SUFFIX_REGEX.test(trimmed)) {
		return new Date(trimmed).getTime();
	}
	return new Date(`${trimmed.replace(" ", "T")}Z`).getTime();
}

/**
 * Compare timestamps and determine LWW winner
 * @param localTimestamp - Local draft updatedAt (Unix ms)
 * @param serverTimestamp - Server updatedAt (ISO string)
 * @returns Winner of the conflict
 */
export function resolveConflict(
	localTimestamp: number,
	serverTimestamp: string,
): ConflictWinner {
	const serverMs = parseServerTimestamp(serverTimestamp);
	return localTimestamp > serverMs ? "local" : "server";
}

/**
 * Convert server note to local draft format
 * Used when initializing from server or when server wins conflict
 */
export function serverNoteToLocalDraft(
	serverNote: ServerNoteWithRelations,
	options?: { syncStatus?: "synced" | "pending" },
): NoteDraft {
	const serverMs = parseServerTimestamp(serverNote.updatedAt);
	return {
		id: serverNote.id,
		title: serverNote.title,
		content: serverNote.content ?? "",
		topicId: serverNote.topicId,
		status: serverNote.status as "draft" | "published",
		relatedNoteIds: serverNote.relatedNoteIds ?? [],
		updatedAt: serverMs,
		syncStatus: options?.syncStatus ?? "synced",
		serverUpdatedAt: serverMs,
		isNew: false,
	};
}

/**
 * Create an empty draft for a new note
 */
export function createEmptyDraft(tempId: string): NoteDraft {
	return {
		id: tempId,
		title: "",
		content: "",
		topicId: "",
		status: "draft",
		relatedNoteIds: [],
		updatedAt: Date.now(),
		syncStatus: "pending",
		serverUpdatedAt: null,
		isNew: true,
	};
}

/**
 * Prepare FormData for sync submission via fetcher
 */
export function prepareSyncFormData(
	draft: NoteDraft,
	intent: "sync" | "create",
): FormData {
	const formData = new FormData();
	formData.set("intent", intent);
	formData.set("title", draft.title);
	formData.set("content", draft.content);
	formData.set("topicId", draft.topicId);
	formData.set("status", draft.status);
	formData.set("relatedNoteIds", JSON.stringify(draft.relatedNoteIds));
	formData.set("clientUpdatedAt", String(draft.updatedAt));
	return formData;
}

/**
 * Process server sync response and determine result
 */
export function processSyncResponse(
	localDraft: NoteDraft,
	response: SyncResponse,
): SyncResult {
	if (response.error) {
		return {
			status: "error",
			error: response.error,
		};
	}

	if (response.conflict && response.note) {
		const serverDraft = serverNoteToLocalDraft(response.note, {
			syncStatus: "synced",
		});
		return {
			status: "conflict-resolved",
			data: serverDraft,
			serverUpdatedAt: new Date(response.note.updatedAt).getTime(),
		};
	}

	if (response.success && response.note) {
		const serverTimestamp = parseServerTimestamp(response.note.updatedAt);
		return {
			status: localDraft.isNew ? "created" : "synced",
			data: {
				...localDraft,
				id: response.note.id,
				syncStatus: "synced",
				updatedAt: serverTimestamp,
				serverUpdatedAt: serverTimestamp,
				isNew: false,
			},
			serverUpdatedAt: serverTimestamp,
		};
	}

	return {
		status: "error",
		error: "Unexpected response from server",
	};
}
