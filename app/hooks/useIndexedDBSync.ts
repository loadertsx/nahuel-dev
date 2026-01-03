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
	prepareSyncFormData,
	processSyncResponse,
	resolveConflict,
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

	// Generate stable ID for new notes (regenerates when noteId prop changes)
	const stableNoteId = useMemo(() => {
		return noteId === "new" ? `new-${crypto.randomUUID()}` : noteId;
	}, [noteId]);

	// Initialize draft on mount or when noteId changes
	useEffect(() => {
		// Reset state when noteId changes
		setIsLoading(true);
		setDraft(null);
		setError(null);
		setSyncStatus("synced");
		isSyncingRef.current = false;

		async function initializeDraft() {
			if (!isClient()) {
				setIsLoading(false);
				return;
			}

			const id = stableNoteId;
			const localDraft = await getDraft(id);

			if (localDraft && initialData) {
				// Both local and server data exist - apply LWW
				const winner = resolveConflict(
					localDraft.updatedAt,
					initialData.updatedAt,
				);

				if (winner === "server") {
					const serverDraft = serverNoteToLocalDraft(initialData);
					await saveDraft(serverDraft);
					setDraft(serverDraft);
				} else {
					setDraft(localDraft);
					setSyncStatus("pending");
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
	}, [stableNoteId, initialData]);

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
		if (fetcher.state === "idle" && fetcher.data && isSyncingRef.current) {
			isSyncingRef.current = false;
			const response = fetcher.data;

			if (!draft) return;

			const result = processSyncResponse(draft, response);

			if (result.status === "error") {
				setError(result.error ?? "Sync failed");
				setSyncStatus("error");
			} else if (result.status === "conflict-resolved" && result.data) {
				// Server won - update local draft
				setDraft(result.data);
				saveDraft(result.data);
				setSyncStatus("synced");
				setLastSyncedAt(new Date());
				setError(null);
			} else if (
				(result.status === "synced" || result.status === "created") &&
				result.data
			) {
				// Sync successful
				const newDraft = result.data;

				// If was a new note, clean up old draft
				if (draft.isNew && newDraft.id !== draft.id) {
					deleteDraft(draft.id);
				}

				setDraft(newDraft);
				saveDraft(newDraft);
				setSyncStatus("synced");
				setLastSyncedAt(new Date());
				setError(null);
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
