import { Suspense } from "react";
import { Await, data } from "react-router";
import { IndexRow } from "~/components/alchemy/index-row";
import { PlateIntro } from "~/components/alchemy/ornament";
import ListSkeleton from "~/components/list-skeleton";
import database from "~/db";
import { Auth } from "~/lib/auth/auth.server";
import { manuscriptDate, parseBlogDate, toRoman } from "~/utils/manuscript";
import type { Route } from "../_layout.blog/+types/route";
import { getAllBlogs } from "./queries.server";

export const handle = { plate: "Plate IV · The Codex" };

export const meta = () => {
	return [
		{ title: "Blog - Loadertsx" },
		{
			name: "description",
			content: "Thoughts on web development and building products",
		},
	];
};

export function headers(_: Route.HeadersArgs) {
	return {
		"Cache-Control": "private, max-age=3600",
	};
}

export const loader = async ({ request, context }: Route.LoaderArgs) => {
	const authManager = await Auth.authManager(context.cloudflare.env.BLOG_DB);
	const _session = await authManager.api.getSession({
		headers: request.headers,
	});

	const db = database(context.cloudflare.env.BLOG_DB);
	const results = getAllBlogs(db);

	return data({ results });
};

type PostSummary = {
	id: string | null;
	title: string | null;
	date: string | null;
	tags: string | null;
};

/** Posts bound into volumes by year, numbered across the whole codex. */
function Codex({ posts }: { posts: PostSummary[] }) {
	const years = new Map<
		number,
		{ post: PostSummary; n: number; date: Date | null }[]
	>();
	posts.forEach((post, i) => {
		const date = parseBlogDate(post.date);
		const year = date?.getFullYear() ?? 0;
		const entries = years.get(year) ?? [];
		entries.push({ post, n: i + 1, date });
		years.set(year, entries);
	});

	return (
		<div className="space-y-10 md:space-y-14">
			{[...years].map(([year, entries]) => (
				<section
					key={year}
					className="flex flex-col md:flex-row gap-2 md:gap-8"
				>
					<header className="md:w-[132px] xl:w-[200px] flex-none flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:pt-4">
						<h2 className="font-serif font-light text-[2.5rem] md:text-[2.6rem] xl:text-[3.5rem] leading-none tracking-normal">
							{year ? toRoman(year) : "Undated"}
						</h2>
						{year > 0 && (
							<span className="caps text-[0.68rem] text-[var(--muted)]">
								{year}
							</span>
						)}
					</header>
					<div className="flex-1 min-w-0 border-t border-[var(--ink)]">
						{entries.map(({ post, n, date }) => (
							<IndexRow
								key={post.id}
								to={`/blog/${post.id}`}
								numeral={toRoman(n)}
								title={post.title ?? "Untitled"}
								subtitle={post.tags}
								date={date ? manuscriptDate(date) : null}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

export default function Blog({ loaderData }: Route.ComponentProps) {
	const { results } = loaderData;

	return (
		<section className="pb-8">
			<PlateIntro
				fig="Fig. IV"
				label="Writings"
				title="The"
				titleItalic="Codex."
				lede="Thoughts on React, TypeScript, and the craft of building for the web."
				note="— notes from the workbench"
			/>
			<Suspense fallback={<ListSkeleton />}>
				<Await resolve={results}>
					{(results) => <Codex posts={results ?? []} />}
				</Await>
			</Suspense>
		</section>
	);
}
