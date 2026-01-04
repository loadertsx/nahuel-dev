import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFetcher } from "react-router";
import {
	deleteDraft,
	getDraft,
	isClient,
	type NoteDraft,
	type ServerNoteWithRelations,
	saveDraft,
} from "~/lib/indexeddb.client";
import {
	createEmptyDraft,
	parseServerTimestamp,
	prepareSyncFormData,
	processSyncResponse,
	type SyncResponse,
	type SyncResult,
	type SyncStatus,
	serverNoteToLocalDraft,
} from "~/lib/sync-engine.client";
import { useSyncStatus } from "./useSyncStatus";

export interface UseIndexedDBSyncOptions {
	noteId: string | "new";
	initialData?: ServerNoteWithRelations;
	syncInterval?: number;
}

export interface UseIndexedDBSyncReturn {
	draft: NoteDraft | null;
	isLoading: boolean;
	updateDraft: (
		updates: Partial<
			Omit<NoteDraft, "id" | "updatedAt" | "syncStatus" | "serverUpdatedAt">
		>,
	) => Promise<void>;
	save: () => Promise<SyncResult>;
	syncStatus: SyncStatus;
	lastSyncedAt: Date | null;
	error: string | null;
	clearDraft: () => Promise<void>;
}

const DEFAULT_SYNC_INTERVAL = 30000;

/**
 * Main hook for IndexedDB sync with server
 * Handles local storage, auto-sync, and conflict resolution
 */
export function useIndexedDBSync(
	options: UseIndexedDBSyncOptions,
): UseIndexedDBSyncReturn {
	const { noteId, initialData, syncInterval = DEFAULT_SYNC_INTERVAL } = options;

	const [draft, setDraft] = useState<NoteDraft | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
	const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
	const [error, setError] = useState<string | null>(null);

	const { isOnline } = useSyncStatus();
	const fetcher = useFetcher<SyncResponse>();

	const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
	const isSyncingRef = useRef(false);
	const pendingInitRef = useRef(false);
	const lastInitSignatureRef = useRef<string | null>(null);

	// Generate stable ID for new notes (regenerates when noteId prop changes)
	const stableNoteId = useMemo(() => {
		return noteId === "new" ? `new-${crypto.randomUUID()}` : noteId;
	}, [noteId]);

	// Initialize draft on mount or when noteId changes
	useEffect(() => {
		const initSignature = `${stableNoteId}|${initialData?.updatedAt ?? "none"}`;

		// Don't re-initialize if sync is in progress
		if (isSyncingRef.current) {
			pendingInitRef.current = true;
			return;
		}

		if (!pendingInitRef.current && lastInitSignatureRef.current === initSignature) {
			return;
		}

		pendingInitRef.current = false;
		lastInitSignatureRef.current = initSignature;

		// Reset state when noteId changes
		setIsLoading(true);
		setDraft(null);
		setError(null);
		setSyncStatus("synced");

		async function initializeDraft() {
			if (!isClient()) {
				setIsLoading(false);
				return;
			}

			// Double-check sync status (could have changed during async operations)
			if (isSyncingRef.current) {
				pendingInitRef.current = true;
				return;
			}

			const id = stableNoteId;
			const localDraft = await getDraft(id);

			if (localDraft && initialData) {
				const serverTimestamp = parseServerTimestamp(initialData.updatedAt);

				// Local draft has pending edits (syncStatus === "pending")
				// or local draft was edited after the last successful sync
				if (
					localDraft.syncStatus === "pending" ||
					(localDraft.serverUpdatedAt !== null &&
						localDraft.updatedAt > localDraft.serverUpdatedAt)
				) {
					// Local has unsynced changes - keep local
					setDraft(localDraft);
					setSyncStatus("pending");
				} else if (localDraft.serverUpdatedAt !== serverTimestamp) {
					// Server has newer data - update local
					const serverDraft = serverNoteToLocalDraft(initialData);
					await saveDraft(serverDraft);
					setDraft(serverDraft);
				} else {
					// Timestamps equal, no changes - keep local
					setDraft(localDraft);
				}
			} else if (localDraft) {
				// Only local data exists
				setDraft(localDraft);
				setSyncStatus(localDraft.syncStatus);
			} else if (initialData) {
				// Only server data exists - create local draft
				const serverDraft = serverNoteToLocalDraft(initialData);
				await saveDraft(serverDraft);
				setDraft(serverDraft);
			} else {
				// New note - create empty draft
				const emptyDraft = createEmptyDraft(id);
				await saveDraft(emptyDraft);
				setDraft(emptyDraft);
			}

			setIsLoading(false);
		}

		initializeDraft();
	}, [stableNoteId, initialData, syncStatus]);

	// Update draft function - saves to IndexedDB immediately
	const updateDraft = useCallback(
		async (
			updates: Partial<
				Omit<NoteDraft, "id" | "updatedAt" | "syncStatus" | "serverUpdatedAt">
			>,
		) => {
			if (!draft) return;

			const updatedDraft: NoteDraft = {
				...draft,
				...updates,
				updatedAt: Date.now(),
				syncStatus: "pending",
			};

			setDraft(updatedDraft);
			setSyncStatus("pending");
			setError(null);

			await saveDraft(updatedDraft);
		},
		[draft],
	);

	// Manual save/sync function
	const save = useCallback(async (): Promise<SyncResult> => {
		if (!draft) {
			return { status: "error", error: "No draft to save" };
		}

		if (!isOnline) {
			setSyncStatus("offline");
			return { status: "error", error: "Offline - changes saved locally" };
		}

		if (isSyncingRef.current) {
			return { status: "error", error: "Sync already in progress" };
		}

		// Validate required fields for new notes
		if (draft.isNew && (!draft.title.trim() || !draft.topicId)) {
			return { status: "error", error: "Title and topic are required" };
		}

		isSyncingRef.current = true;
		setSyncStatus("syncing");
		setError(null);

		const intent = draft.isNew ? "create" : "sync";
		const action = draft.isNew
			? "/admin/notes/new"
			: `/admin/notes/${draft.id}`;

		fetcher.submit(prepareSyncFormData(draft, intent), {
			method: "POST",
			action,
		});

		// Return a pending result - actual result comes from useEffect
		return { status: "synced" };
	}, [draft, isOnline, fetcher]);

	// Handle fetcher response
	useEffect(() => {
		async function handleResponse() {
			if (fetcher.state === "idle" && fetcher.data && isSyncingRef.current) {
				const response = fetcher.data;

				if (!draft) {
					isSyncingRef.current = false;
					return;
				}

				const result = processSyncResponse(draft, response);

				if (result.status === "error") {
					setError(result.error ?? "Sync failed");
					setSyncStatus("error");
					isSyncingRef.current = false;
				} else if (result.status === "conflict-resolved" && result.data) {
					// Server won - update local draft
					await saveDraft(result.data);
					setDraft(result.data);
					setSyncStatus("synced");
					setLastSyncedAt(new Date());
					setError(null);
					isSyncingRef.current = false;
				} else if (
					(result.status === "synced" || result.status === "created") &&
					result.data
				) {
					// Sync successful
					const newDraft = result.data;

					// If was a new note, clean up old draft
					if (draft.isNew && newDraft.id !== draft.id) {
						await deleteDraft(draft.id);
					}

					await saveDraft(newDraft);
					setDraft(newDraft);
					setSyncStatus("synced");
					setLastSyncedAt(new Date());
					setError(null);
					isSyncingRef.current = false;
				}
			}

			// Handle fetch error
			if (
				fetcher.state === "idle" &&
				!fetcher.data &&
				isSyncingRef.current &&
				syncStatus === "syncing"
			) {
				isSyncingRef.current = false;
				setError("Network error - changes saved locally");
				setSyncStatus("error");
			}
		}

		handleResponse();
	}, [fetcher.state, fetcher.data, draft, syncStatus]);

	// Handle online/offline transitions
	useEffect(() => {
		if (!isOnline) {
			if (syncStatus === "syncing" || syncStatus === "pending") {
				setSyncStatus("offline");
			}
		} else if (syncStatus === "offline" && draft?.syncStatus === "pending") {
			setSyncStatus("pending");
			// Trigger sync when coming back online
			save();
		}
	}, [isOnline, syncStatus, draft?.syncStatus, save]);

	// Auto-sync interval
	useEffect(() => {
		if (!isClient()) return;

		syncIntervalRef.current = setInterval(() => {
			if (
				draft?.syncStatus === "pending" &&
				isOnline &&
				!isSyncingRef.current
			) {
				save();
			}
		}, syncInterval);

		return () => {
			if (syncIntervalRef.current) {
				clearInterval(syncIntervalRef.current);
			}
		};
	}, [draft?.syncStatus, isOnline, save, syncInterval]);

	// Clear draft function
	const clearDraft = useCallback(async () => {
		if (draft) {
			await deleteDraft(draft.id);
			setDraft(null);
		}
	}, [draft]);

	return {
		draft,
		isLoading,
		updateDraft,
		save,
		syncStatus,
		lastSyncedAt,
		error,
		clearDraft,
	};
}

export type { SyncStatus };
