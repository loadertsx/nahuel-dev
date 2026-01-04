import { data, redirect } from "react-router";
import { TopicForm } from "~/components/admin/TopicForm";
import database from "~/db";
import { topics } from "~/db/schemas/topics";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import { topicSchema } from "~/lib/schemas/topic";
import type { Route } from "./+types/route";

export async function loader({ request, context }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	return null;
}

export async function action({ request, context }: Route.ActionArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const formData = await request.formData();
	const name = formData.get("name") as string;

	const result = topicSchema.safeParse({ name });
	if (!result.success) {
		const fieldErrors = result.error.flatten().fieldErrors;
		return data(
			{ fieldErrors: { name: fieldErrors.name?.[0] } },
			{ status: 400 },
		);
	}

	const db = database(context.cloudflare.env.BLOG_DB);
	const id = crypto.randomUUID();

	await db.insert(topics).values({
		id,
		name: result.data.name.trim(),
	});

	return redirect("/admin/topics");
}

export default function NewTopic() {
	return <TopicForm mode="create" />;
}
