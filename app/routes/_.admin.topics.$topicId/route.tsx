import { data, redirect } from "react-router";
import { TopicForm } from "~/components/admin/TopicForm";
import database from "~/db";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import { topicSchema } from "~/lib/schemas/topic";
import type { Route } from "./+types/route";
import { getTopic, updateTopic } from "./queries.server";

export async function loader({ request, context, params }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	const db = database(context.cloudflare.env.BLOG_DB);
	const topic = await getTopic(db, params.topicId);

	if (!topic) {
		throw new Response("Not Found", { status: 404 });
	}

	return data({ topic });
}

export async function action({ request, context, params }: Route.ActionArgs) {
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
	await updateTopic(db, params.topicId, result.data.name.trim());

	return redirect("/admin/topics");
}

export default function EditTopic({ loaderData }: Route.ComponentProps) {
	const { topic } = loaderData;

	return <TopicForm mode="edit" initialData={topic} />;
}
