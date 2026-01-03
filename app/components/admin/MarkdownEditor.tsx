import { Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { MarkdownView } from "~/components/markdown";
import { markdownParser } from "~/utils/md.client";

export interface MarkdownEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	minHeight?: string;
	label?: string;
}

export function MarkdownEditor({
	value,
	onChange,
	placeholder = "Write your content in markdown...",
	minHeight = "320px",
	label,
}: MarkdownEditorProps) {
	const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

	return (
		<div className="flex flex-col gap-1">
			{label && (
				<label className="text-sm font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
					{label}
				</label>
			)}

			<div className="rounded-xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] overflow-hidden bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)]">
				{/* Tab bar */}
				<div className="flex items-center gap-1 px-2 py-1.5 bg-[var(--color-surface)]/50 dark:bg-[var(--color-dark-surface)]/50 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
					<button
						type="button"
						onClick={() => setActiveTab("write")}
						className={`
							flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
							${
								activeTab === "write"
									? "text-[var(--color-accent)] dark:text-[var(--color-dark-accent)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] shadow-sm"
									: "text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)]"
							}
						`}
					>
						<Pencil className="w-3.5 h-3.5" />
						Write
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("preview")}
						className={`
							flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
							${
								activeTab === "preview"
									? "text-[var(--color-accent)] dark:text-[var(--color-dark-accent)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] shadow-sm"
									: "text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)]"
							}
						`}
					>
						<Eye className="w-3.5 h-3.5" />
						Preview
					</button>
				</div>

				{/* Content panels */}
				<div className="relative">
					{/* Write panel */}
					<div
						className={`transition-opacity duration-200 ${
							activeTab === "write"
								? "opacity-100"
								: "opacity-0 absolute inset-0 pointer-events-none"
						}`}
					>
						<textarea
							value={value}
							onChange={(e) => onChange(e.target.value)}
							placeholder={placeholder}
							className="w-full bg-transparent text-[var(--color-text)] dark:text-[var(--color-dark-text)] placeholder:text-[var(--color-text-secondary)]/50 dark:placeholder:text-[var(--color-dark-text-secondary)]/50 font-mono text-sm leading-relaxed resize-none p-4 focus:outline-none"
							style={{ minHeight }}
						/>
					</div>

					{/* Preview panel */}
					<div
						className={`transition-opacity duration-200 ${
							activeTab === "preview"
								? "opacity-100"
								: "opacity-0 absolute inset-0 pointer-events-none"
						}`}
					>
						<div
							className="p-4 overflow-auto prose prose-sm max-w-none"
							style={{ minHeight }}
						>
							{value.trim() ? (
								<MarkdownView content={markdownParser(value)} />
							) : (
								<p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] italic">
									Nothing to preview yet. Start writing in the Write tab.
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Character count */}
			<div className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] text-right">
				{value.length} characters
			</div>
		</div>
	);
}
