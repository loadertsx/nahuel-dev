import { ArrowRight, FileText, Tags } from "lucide-react";
import { Link } from "react-router";

const navigationItems = [
	{
		title: "Notes",
		description: "Create, edit, and organize your personal notes and ideas",
		href: "/admin/notes",
		icon: FileText,
		count: "Manage content",
	},
	{
		title: "Topics",
		description: "Categorize and structure your notes with custom topics",
		href: "/admin/topics",
		icon: Tags,
		count: "Organize",
	},
];

export default function AdminDashboard() {
	return (
		<section className="max-w-3xl">
			{/* Header */}
			<div className="mb-12">
				<h1 className="font-serif text-4xl font-medium tracking-tight text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
					Dashboard
				</h1>
				<p className="mt-3 text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
					Manage your content and settings
				</p>
			</div>

			{/* Navigation Grid */}
			<div className="grid gap-4 sm:grid-cols-2">
				{navigationItems.map((item) => {
					const Icon = item.icon;
					return (
						<Link
							key={item.href}
							to={item.href}
							viewTransition
							prefetch="intent"
							className="group relative flex flex-col p-6 rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] transition-all duration-300 hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.4)]"
						>
							{/* Icon Container */}
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] transition-colors duration-300 group-hover:bg-[var(--color-accent)]/10 dark:group-hover:bg-[var(--color-dark-accent)]/10">
								<Icon
									className="h-5 w-5 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] transition-colors duration-300 group-hover:text-[var(--color-accent)] dark:group-hover:text-[var(--color-dark-accent)]"
									strokeWidth={1.5}
								/>
							</div>

							{/* Content */}
							<div className="flex-1">
								<div className="flex items-center gap-2">
									<h2 className="font-serif text-xl font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
										{item.title}
									</h2>
									<ArrowRight
										className="h-4 w-4 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--color-accent)] dark:group-hover:text-[var(--color-dark-accent)]"
										strokeWidth={1.5}
									/>
								</div>
								<p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
									{item.description}
								</p>
							</div>

							{/* Tag */}
							<div className="mt-4 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
								<span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]/70 dark:text-[var(--color-dark-text-secondary)]/70">
									{item.count}
								</span>
							</div>
						</Link>
					);
				})}
			</div>
		</section>
	);
}
