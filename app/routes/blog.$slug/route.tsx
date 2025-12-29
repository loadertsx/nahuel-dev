import { ArrowLeft } from "lucide-react";
import { data, useNavigate } from "react-router";
import { MarkdownView } from "~/components/markdown";
import { markdownParser } from "~/utils/md.server";
import type { Route } from "../blog.$slug/+types/route";
import { getBlogPost } from "./queries.server";
import database from "~/db";

interface IBlog {
	content: string | null;
	tags: string | null;
	title: string | null;
}

export function headers(_: Route.HeadersArgs) {
	return {
		"Cache-Control": "private, max-age=3600",
	};
}

export async function loader({ params, context }: Route.LoaderArgs) {
	const slug = params.slug;

	const db = database(context.cloudflare.env.BLOG_DB);
	const result: IBlog[] = await getBlogPost(String(slug), db);
	const content = result[0]?.content && markdownParser(result[0].content);
	const tags = result[0]?.tags;
	const title = result[0]?.title;

	return data({ content, tags, title });
}

export const meta = ({ data }: Route.MetaArgs) => {
	return [
		{ title: data?.title || "Loadertsx" },
		{ name: "description", content: `${data?.tags}` },
	];
};

export default function BlogId({ loaderData }: Route.ComponentProps) {
	const { content } = loaderData;
	const navigate = useNavigate();

	return (
		<div className="lg:min-w-[800px] lg:max-w-[800px] mx-auto prose prose-md lg:prose-lg">
			<button
				type="button"
				className="flex mb-10 dark:text-white items-center font-bold gap-2 z-0 transition-transform transform hover:-translate-x-1 focus:outline-none cursor-pointer"
				onClick={() => {
					navigate("/blog");
				}}
			>
				<ArrowLeft />
				<span className="mb-[1px]">Back to posts</span>
			</button>
			{content && <MarkdownView content={content} />}
		</div>
	);
}
