import { data } from "react-router";
import { Eyebrow } from "~/components/alchemy/ornament";
import { SigilLink } from "~/components/alchemy/sigil-link";
import { MarkdownView } from "~/components/markdown";
import database from "~/db";
import { manuscriptDate, parseBlogDate } from "~/utils/manuscript";
import { markdownParser } from "~/utils/md.server";
import type { Route } from "../blog.$slug/+types/route";
import { getBlogPost } from "./queries.server";

export const handle = { plate: "Plate IV · Folio" };

export function headers(_: Route.HeadersArgs) {
	return {
		"Cache-Control": "private, max-age=3600",
	};
}

export async function loader({ params, context }: Route.LoaderArgs) {
	const db = database(context.cloudflare.env.BLOG_DB);
	const [post] = await getBlogPost(String(params.slug), db);
	const content = post?.content && markdownParser(post.content);
	const date = parseBlogDate(post?.date ?? null);

	return data({
		content,
		tags: post?.tags,
		title: post?.title,
		date: date ? manuscriptDate(date) : null,
	});
}

export const meta = ({ data }: Route.MetaArgs) => {
	return [
		{ title: data?.title || "Loadertsx" },
		{ name: "description", content: `${data?.tags}` },
	];
};

export default function BlogId({ loaderData }: Route.ComponentProps) {
	const { content, tags, date } = loaderData;

	return (
		<div className="max-w-[760px] pt-8 md:pt-14 pb-8 space-y-6">
			<SigilLink to="/blog">Back to the Codex</SigilLink>
			<Eyebrow fig="Folio" label={date ?? "Undated"} />
			{tags && <p className="italic text-[1rem] text-[var(--muted)]">{tags}</p>}
			<div className="folio folio-post border-t border-[var(--ink)] pt-8 md:pt-10">
				{content && <MarkdownView content={content} />}
			</div>
		</div>
	);
}
