const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const;

export default function ListSkeleton() {
	return (
		<div className="space-y-1">
			{SKELETON_IDS.map((id) => (
				<div
					key={id}
					className="flex items-center justify-between py-4 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]"
				>
					<div
						className="h-5 bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] rounded animate-pulse"
						style={{ width: `${Math.random() * 40 + 40}%` }}
					/>
					<div className="h-4 w-16 bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] rounded animate-pulse" />
				</div>
			))}
		</div>
	);
}
