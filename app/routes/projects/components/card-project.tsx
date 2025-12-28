import { ArrowUpRight, Github } from "lucide-react";

export default function CardProject({
	title,
	content,
	deployLink,
	codeLink,
	tags,
	index = 0,
}: {
	title: string;
	content: string;
	deployLink: string;
	codeLink: string;
	tags: string[];
	index?: number;
}) {
	return (
		<article
			className="group relative p-6 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-surface)]/50 dark:bg-[var(--color-dark-surface)]/50 transition-all duration-300 hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] hover:shadow-sm"
			style={{ animationDelay: `${index * 100}ms` }}
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-3">
				<h3 className="font-serif text-xl">{title}</h3>
				<div className="flex items-center gap-2">
					<a
						href={codeLink}
						target="_blank"
						rel="noopener noreferrer"
						className="p-1.5 rounded-full text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-dark-border)] transition-colors"
						aria-label={`View ${title} source code`}
					>
						<Github className="w-4 h-4" />
					</a>
					<a
						href={deployLink}
						target="_blank"
						rel="noopener noreferrer"
						className="p-1.5 rounded-full text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] hover:bg-[var(--color-border)] dark:hover:bg-[var(--color-dark-border)] transition-colors"
						aria-label={`Visit ${title} website`}
					>
						<ArrowUpRight className="w-4 h-4" />
					</a>
				</div>
			</div>

			{/* Description */}
			<p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed mb-4">
				{content}
			</p>

			{/* Tags */}
			<div className="flex flex-wrap gap-2">
				{tags.map((tag) => (
					<span
						key={tag}
						className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]"
					>
						{tag}
					</span>
				))}
			</div>

			{/* Hover accent line */}
			<div className="absolute bottom-0 left-6 right-6 h-px bg-[var(--color-accent)] dark:bg-[var(--color-dark-accent)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
		</article>
	);
}
