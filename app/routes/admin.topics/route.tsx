import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { data, Link, useFetcher } from "react-router";
import { DeleteConfirmationModal } from "~/components/admin/DeleteConfirmationModal";
import { Button } from "~/components/ui/Button";
import database from "~/db";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import type { Route } from "./+types/route";
import { deleteTopic, getTopicsWithNotesCount } from "./queries.server";

export async function loader({ request, context }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const db = database(context.cloudflare.env.BLOG_DB);
	const topics = await getTopicsWithNotesCount(db);
	return data({ topics });
}

export async function action({ request, context }: Route.ActionArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "delete") {
		const topicId = formData.get("topicId") as string;
		const db = database(context.cloudflare.env.BLOG_DB);
		await deleteTopic(db, topicId);
		return data({ success: true });
	}

	return data({ error: "Invalid intent" }, { status: 400 });
}

export default function AdminTopics({ loaderData }: Route.ComponentProps) {
	const { topics } = loaderData;
	const fetcher = useFetcher();
	const [deleteModal, setDeleteModal] = useState<{
		isOpen: boolean;
		topic: (typeof topics)[number] | null;
	}>({ isOpen: false, topic: null });

	const isDeleting = fetcher.state !== "idle";

	const handleDelete = () => {
		if (!deleteModal.topic) return;
		fetcher.submit(
			{ intent: "delete", topicId: deleteModal.topic.id },
			{ method: "post" },
		);
		setDeleteModal({ isOpen: false, topic: null });
	};

	const getWarningMessage = (notesCount: number) => {
		if (notesCount === 0) return undefined;
		return `This topic has ${notesCount} note${notesCount > 1 ? "s" : ""} that will be permanently deleted.`;
	};

	return (
		<section>
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
						Topics
					</h1>
					<p className="mt-1 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
						Organize your notes by topic
					</p>
				</div>
				<Link to="/admin/topics/new">
					<Button variant="accent" className="flex items-center gap-2">
						<Plus className="w-4 h-4" />
						New Topic
					</Button>
				</Link>
			</div>

			{topics.length === 0 ? (
				<div className="text-center py-16 px-4 rounded-2xl border border-dashed border-[var(--color-border-strong)] dark:border-[var(--color-dark-border-strong)] bg-[var(--color-surface)]/50 dark:bg-[var(--color-dark-surface)]/50">
					<div className="w-12 h-12 rounded-full bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] flex items-center justify-center mx-auto mb-4">
						<Plus className="w-6 h-6 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]" />
					</div>
					<h3 className="font-serif text-lg font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
						No topics yet
					</h3>
					<p className="mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
						Create your first topic to start organizing notes.
					</p>
					<Link to="/admin/topics/new" className="inline-block mt-4">
						<Button variant="secondary">Create Topic</Button>
					</Link>
				</div>
			) : (
				<div className="rounded-2xl border border-[var(--color-border)] dark:border-[var(--color-dark-border)] overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
								<th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
									Name
								</th>
								<th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
									Notes
								</th>
								<th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--color-border)] dark:divide-[var(--color-dark-border)]">
							{topics.map((topic) => (
								<tr
									key={topic.id}
									className="bg-[var(--color-bg)] dark:bg-[var(--color-dark-bg)] hover:bg-[var(--color-surface)]/50 dark:hover:bg-[var(--color-dark-surface)]/50 transition-colors"
								>
									<td className="py-4 px-4">
										<span className="font-medium text-[var(--color-text)] dark:text-[var(--color-dark-text)]">
											{topic.name}
										</span>
									</td>
									<td className="py-4 px-4">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
											{topic.notesCount}
										</span>
									</td>
									<td className="py-4 px-4 text-right">
										<div className="flex items-center justify-end gap-1">
											<Link to={`/admin/topics/${topic.id}`}>
												<Button variant="icon" aria-label="Edit topic">
													<Pencil className="w-4 h-4" />
												</Button>
											</Link>
											<Button
												variant="icon"
												aria-label="Delete topic"
												onPress={() =>
													setDeleteModal({ isOpen: true, topic })
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
				</div>
			)}

			<DeleteConfirmationModal
				isOpen={deleteModal.isOpen}
				onOpenChange={(isOpen) =>
					setDeleteModal((prev) => ({ ...prev, isOpen }))
				}
				onConfirm={handleDelete}
				itemName={deleteModal.topic?.name ?? ""}
				itemType="topic"
				warningMessage={getWarningMessage(deleteModal.topic?.notesCount ?? 0)}
				isDeleting={isDeleting}
			/>
		</section>
	);
}
