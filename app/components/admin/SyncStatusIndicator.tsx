import { AlertCircle, Check, Clock, Loader2, WifiOff } from "lucide-react";
import { tv } from "tailwind-variants";
import { Button } from "~/components/ui/Button";

export type SyncStatus = "synced" | "pending" | "syncing" | "error" | "offline";

export interface SyncStatusIndicatorProps {
	status: SyncStatus;
	lastSyncedAt: Date | null;
	onRetry?: () => void;
}

const statusStyles = tv({
	base: "flex items-center gap-2 text-sm font-medium transition-colors duration-200",
	variants: {
		status: {
			synced: "text-emerald-600 dark:text-emerald-400",
			pending: "text-amber-600 dark:text-amber-400",
			syncing:
				"text-[var(--color-accent)] dark:text-[var(--color-dark-accent)]",
			error: "text-red-500 dark:text-red-400",
			offline:
				"text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]",
		},
	},
});

const iconStyles = tv({
	base: "w-4 h-4 flex-shrink-0",
	variants: {
		status: {
			synced: "",
			pending: "",
			syncing: "animate-spin",
			error: "",
			offline: "",
		},
	},
});

function formatRelativeTime(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);

	if (diffSec < 10) return "just now";
	if (diffSec < 60) return `${diffSec}s ago`;
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHour < 24) return `${diffHour}h ago`;
	return `${diffDay}d ago`;
}

const statusConfig: Record<
	SyncStatus,
	{ icon: typeof Check; label: string | ((date: Date | null) => string) }
> = {
	synced: {
		icon: Check,
		label: (date) => (date ? `Saved ${formatRelativeTime(date)}` : "Saved"),
	},
	pending: {
		icon: Clock,
		label: "Unsaved changes",
	},
	syncing: {
		icon: Loader2,
		label: "Saving...",
	},
	error: {
		icon: AlertCircle,
		label: "Save failed",
	},
	offline: {
		icon: WifiOff,
		label: "Offline",
	},
};

export function SyncStatusIndicator({
	status,
	lastSyncedAt,
	onRetry,
}: SyncStatusIndicatorProps) {
	const config = statusConfig[status];
	const Icon = config.icon;
	const label =
		typeof config.label === "function"
			? config.label(lastSyncedAt)
			: config.label;

	return (
		<div className={statusStyles({ status })}>
			<Icon className={iconStyles({ status })} aria-hidden="true" />
			<span>{label}</span>
			{status === "error" && onRetry && (
				<Button
					variant="ghost"
					onPress={onRetry}
					className="ml-1 px-2 py-1 text-xs rounded-md hover:bg-red-50 dark:hover:bg-red-950/30"
				>
					Retry
				</Button>
			)}
		</div>
	);
}
