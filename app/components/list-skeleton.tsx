export default function ListSkeleton() {
	const items = Array.from({ length: 6 }, (_, index) => index);
	return (
		<div className="space-y-1">
			{items.map((_, index) => (
				<div
					key={index}
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
