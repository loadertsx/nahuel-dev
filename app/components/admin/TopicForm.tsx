import { ArrowLeft } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Form, Link, useActionData, useNavigation } from "react-router";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { topicSchema } from "~/lib/schemas/topic";

export interface TopicFormProps {
	mode: "create" | "edit";
	initialData?: { id: string; name: string };
}

export function TopicForm({ mode, initialData }: TopicFormProps) {
	const navigation = useNavigation();
	const actionData = useActionData<{ error?: string; fieldErrors?: { name?: string } }>();
	const isSubmitting = navigation.state === "submitting";
	const [clientError, setClientError] = useState<string | null>(null);

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		const formData = new FormData(e.currentTarget);
		const name = formData.get("name") as string;

		const result = topicSchema.safeParse({ name });
		if (!result.success) {
			e.preventDefault();
			setClientError(result.error.errors[0]?.message ?? "Invalid input");
			return;
		}
		setClientError(null);
	};

	const nameError = clientError ?? actionData?.fieldErrors?.name;

	return (
		<div className="max-w-lg">
			<Link
				to="/admin/topics"
				className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors mb-6"
			>
				<ArrowLeft className="w-4 h-4" />
				Back to Topics
			</Link>

			<h1 className="font-serif text-3xl font-medium tracking-tight text-[var(--color-text)] dark:text-[var(--color-dark-text)] mb-2">
				{mode === "create" ? "Create Topic" : "Edit Topic"}
			</h1>
			<p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-8">
				{mode === "create"
					? "Add a new topic to organize your notes."
					: "Update the topic details."}
			</p>

			<Form method="post" className="space-y-6" onSubmit={handleSubmit}>
				<TextField
					label="Topic Name"
					name="name"
					defaultValue={initialData?.name}
					isRequired
					autoFocus
					isInvalid={!!nameError}
					errorMessage={nameError}
					onChange={() => setClientError(null)}
				/>

				<div className="flex gap-3 pt-2">
					<Link to="/admin/topics" className="flex-1">
						<Button variant="secondary" className="w-full" type="button">
							Cancel
						</Button>
					</Link>
					<Button
						type="submit"
						variant="accent"
						className="flex-1"
						isDisabled={isSubmitting}
					>
						{isSubmitting
							? mode === "create"
								? "Creating..."
								: "Updating..."
							: mode === "create"
								? "Create Topic"
								: "Update Topic"}
					</Button>
				</div>
			</Form>
		</div>
	);
}
