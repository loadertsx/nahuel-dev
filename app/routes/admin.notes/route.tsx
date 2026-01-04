import { Filter, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { data, Link, useFetcher } from "react-router";
import { deleteDraft } from "~/lib/indexeddb.client";
import { DeleteConfirmationModal } from "~/components/admin/DeleteConfirmationModal";
import { Button } from "~/components/ui/Button";
import database from "~/db";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import type { Route } from "./+types/route";
import { getTopics } from "~/lib/queries/topics.server";
import { deleteNote, getAllNotesAdmin } from "./queries.server";

export async function loader({ request, context }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const db = database(context.cloudflare.env.BLOG_DB);
	const [notes, topics] = await Promise.all([
		getAllNotesAdmin(db),
		getTopics(db),
	]);
	return data({ notes, topics });
}

export async function action({ request, context }: Route.ActionArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "delete") {
		const noteId = formData.get("noteId") as string;
		const db = database(context.cloudflare.env.BLOG_DB);
		await deleteNote(db, noteId);
		return data({ success: true });
	}

	return data({ error: "Invalid intent" }, { status: 400 });
}

function formatRelativeDate(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

	if (diffDays === 0) {
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		if (diffHours === 0) {
			const diffMins = Math.floor(diffMs / (1000 * 60));
			return diffMins <= 1 ? "Just now" : `${diffMins}m ago`;
		}
		return `${diffHours}h ago`;
	}
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

export default function AdminNotes({ loaderData }: Route.ComponentProps) {
	const { notes, topics } = loaderData;
	const fetcher = useFetcher();
	const [selectedTopicId, setSelectedTopicId] = useState<string>("all");
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		note: (typeof notes)[number] | null;
	}>({ isOpen: false, note: null });
	const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

	const isDeleting = fetcher.state !== "idle";

	// Cleanup IndexedDB draft after successful delete
	useEffect(() => {
		if (fetcher.state === "idle" && fetcher.data?.success && deletingNoteId) {
			deleteDraft(deletingNoteId);
			setDeletingNoteId(null);
		}
	}, [fetcher.state, fetcher.data, deletingNoteId]);

	const filteredNotes =
		selectedTopicId === "all"
			? notes
			: notes.filter((note) => note.topicId === selectedTopicId);

	const handleDelete = () => {
		if (!deleteModal.note) return;
		setDeletingNoteId(deleteModal.note.id);
		fetcher.submit(
			{ intent: "delete", noteId: deleteModal.note.id },
			{ method: "post" },
		);
		setDeleteModal({ isOpen: false, note: null });
	};

	const getWarningMessage = (relatedCount: number) => {
		if (relatedCount === 0) return undefined;
		return `This note has ${relatedCount} related note${relatedCount > 1 ? "s" : ""} that will be unlinked.`;
	};

	return (
		<section>
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
						Notes
					</h1>
					<p className="mt-1 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
						Manage your notes and drafts
					</p>
				</div>
				<Link to="/admin/notes/new">
					<Button variant="accent" className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						New Note
					</Button>
				</Link>
			</div>

			{notes.length === 0 ? (
				<div className="text-center py-16 px-4 rounded-2xl border border-dashed border-[var(--color-border-strong)] dark:border-[var(--color-dark-border-strong)] bg-[var(--color-surface)]/50 dark:bg-[var(--color-dark-surface)]/50">
					<div className="w-12 h-12 rounded-full bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] flex items-center justify-center mx-auto mb-4">
						<Plus className="w-6 h-6 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]" />
					</div>
					<h3 className="font-serif text-lg font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
						No notes yet
					</h3>
					<p className="mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
						Create your first note to get started.
					</p>
					<Link to="/admin/notes/new" className="inline-block mt-4">
						<Button variant="secondary">Create Note</Button>
					</Link>
				</div>
			) : (
				<>
					{/* Topic Filter */}
					{topics.length > 0 && (
						<div className="mb-6 flex items-center gap-3">
							<div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
								<Filter className="w-4 h-4" />
								<span>Filter:</span>
							</div>
							<select
								value={selectedTopicId}
								onChange={(e) => setSelectedTopicId(e.target.value)}
								className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] text-[var(--color-text)] dark:text-[var(--color-dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
							>
								<option value="all">All Topics</option>
								{topics.map((topic) => (
									<option key={topic.id} value={topic.id}>
										{topic.name}
									</option>
								))}
							</select>
							{selectedTopicId !== "all" && (
								<button
									type="button"
									onClick={() => setSelectedTopicId("all")}
									className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] underline underline-offset-2"
								>
									Clear filter
								</button>
							)}
						</div>
					)}

					<div className="rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
									<th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
										Title
									</th>
									<th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
										Topic
									</th>
									<th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
										Status
									</th>
									<th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
										Updated
									</th>
									<th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-dark-border)]">
								{filteredNotes.map((note) => (
									<tr
										key={note.id}
										className="bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] hover:bg-[var(--color-surface)]/50 dark:hover:bg-[var(--color-dark-surface)]/50 transition-colors"
									>
										<td className="py-4 px-4">
											<span className="font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
												{note.title}
											</span>
										</td>
										<td className="py-4 px-4">
											<span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
												{note.topicName ?? "-"}
											</span>
										</td>
										<td className="py-4 px-4">
											{note.status === "published" ? (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
													Published
												</span>
											) : (
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
													Draft
												</span>
											)}
										</td>
										<td className="py-4 px-4">
											<span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
												{formatRelativeDate(note.updatedAt)}
											</span>
										</td>
										<td className="py-4 px-4 text-right">
											<div className="flex items-center justify-end gap-1">
												<Link to={`/admin/notes/${note.id}`}>
													<Button variant="icon" aria-label="Edit note">
														<Pencil className="w-4 h-4" />
													</Button>
												</Link>
												<Button
													variant="icon"
													aria-label="Delete note"
													onPress={() =>
														setDeleteModal({ isOpen: true, note })
													}
													className="hover:text-red-500 dark:hover:text-red-400"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>

						{filteredNotes.length === 0 && notes.length > 0 && (
							<div className="py-8 text-center text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
								No notes found for this topic.
							</div>
						)}
					</div>
				</>
			)}

			<DeleteConfirmationModal
				isOpen={deleteModal.isOpen}
				onOpenChange={(isOpen) =>
					setDeleteModal((prev) => ({ ...prev, isOpen }))
				}
				onConfirm={handleDelete}
				itemName={deleteModal.note?.title ?? ""}
				itemType="note"
				warningMessage={getWarningMessage(
					deleteModal.note?.relatedNotesCount ?? 0,
				)}
				isDeleting={isDeleting}
			/>
		</section>
	);
}
