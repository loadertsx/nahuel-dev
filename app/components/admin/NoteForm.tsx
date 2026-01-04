import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { MarkdownEditor } from "~/components/admin/MarkdownEditor";
import { SyncStatusIndicator } from "~/components/admin/SyncStatusIndicator";
import { Button } from "~/components/ui/Button";
import { Select, SelectItem } from "~/components/ui/Select";
import { TextField } from "~/components/ui/TextField";
import { useIndexedDBSync } from "~/hooks/useIndexedDBSync";
import type { ServerNoteWithRelations } from "~/lib/indexeddb.client";
import { RelatedNotesSelector } from "./RelatedNotesSelector";

export interface NoteFormProps {
	mode: "create" | "edit";
	noteId: string;
	initialData?: ServerNoteWithRelations;
	topics: Array<{ id: string; name: string }>;
	allNotes: Array<{ id: string; title: string }>;
}

export function NoteForm({
	mode,
	noteId,
	initialData,
	topics,
	allNotes,
}: NoteFormProps) {
	const navigate = useNavigate();

	const { draft, isLoading, updateDraft, save, syncStatus, lastSyncedAt } =
		useIndexedDBSync({
			noteId: noteId === "new" ? "new" : noteId,
			initialData,
		});

	const handleSave = async () => {
		const result = await save();
		if (result.status === "created" && result.data) {
			// Redirect to edit page with new ID
			navigate(`/admin/notes/${result.data.id}`);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
					Loading...
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl pb-16">
			<Link
				to="/admin/notes"
				className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors mb-6"
			>
				<ArrowLeft className="w-4 h-4" />
				Back to Notes
			</Link>

			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-2">
						{mode === "create" ? "Create Note" : "Edit Note"}
					</h1>
					<p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
						{mode === "create"
							? "Create a new note with markdown content."
							: "Update the note details."}
					</p>
				</div>
				<SyncStatusIndicator
					status={syncStatus}
					lastSyncedAt={lastSyncedAt}
					onRetry={handleSave}
				/>
			</div>

			<div className="space-y-6">
				<TextField
					label="Title"
					value={draft?.title ?? ""}
					onChange={(value) => updateDraft({ title: value })}
					isRequired
					autoFocus
				/>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Select
						label="Topic"
						selectedKey={draft?.topicId || null}
						onSelectionChange={(key) => updateDraft({ topicId: key as string })}
						isRequired
					>
						{topics.map((topic) => (
							<SelectItem key={topic.id} id={topic.id}>
								{topic.name}
							</SelectItem>
						))}
					</Select>

					<Select
						label="Status"
						selectedKey={draft?.status || "draft"}
						onSelectionChange={(key) =>
							updateDraft({ status: key as "draft" | "published" })
						}
					>
						<SelectItem id="draft">Draft</SelectItem>
						<SelectItem id="published">Published</SelectItem>
					</Select>
				</div>

				<MarkdownEditor
					label="Content"
					value={draft?.content ?? ""}
					onChange={(value) => updateDraft({ content: value })}
					placeholder="Write your note content in markdown..."
					minHeight="400px"
				/>

				<RelatedNotesSelector
					selectedIds={draft?.relatedNoteIds ?? []}
					availableNotes={allNotes}
					currentNoteId={mode === "edit" ? noteId : undefined}
					onChange={(ids) => updateDraft({ relatedNoteIds: ids })}
				/>
			</div>

			<div className="flex gap-3 pt-8">
				<Link to="/admin/notes" className="flex-1">
					<Button variant="secondary" className="w-full" type="button">
						Cancel
					</Button>
				</Link>
				<Button
					type="button"
					variant="accent"
					className="flex-1"
					onPress={handleSave}
					isDisabled={syncStatus === "syncing"}
				>
					{syncStatus === "syncing" ? "Saving..." : "Save"}
				</Button>
			</div>
		</div>
	);
}
