import { useCallback, useEffect, useState } from "react";

export interface UseSyncStatusReturn {
	isOnline: boolean;
	formatLastSync: (lastSyncedAt: Date | null) => string | null;
}

/**
 * Hook to detect online/offline status and format sync timestamps
 */
export function useSyncStatus(): UseSyncStatusReturn {
	const [isOnline, setIsOnline] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;

		setIsOnline(navigator.onLine);

		const handleOnline = () => setIsOnline(true);
		const handleOffline = () => setIsOnline(false);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const formatLastSync = useCallback(
		(lastSyncedAt: Date | null): string | null => {
			if (!lastSyncedAt) return null;

			const now = new Date();
			const diffMs = now.getTime() - lastSyncedAt.getTime();
			const diffSeconds = Math.floor(diffMs / 1000);
			const diffMinutes = Math.floor(diffSeconds / 60);
			const diffHours = Math.floor(diffMinutes / 60);

			if (diffSeconds < 5) return "Just now";
			if (diffSeconds < 60) return `${diffSeconds}s ago`;
			if (diffMinutes < 60) return `${diffMinutes}m ago`;
			if (diffHours < 24) return `${diffHours}h ago`;

			return lastSyncedAt.toLocaleDateString();
		},
		[],
	);

	return { isOnline, formatLastSync };
}
