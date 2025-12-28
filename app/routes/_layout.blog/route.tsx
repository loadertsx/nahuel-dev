import { Link, Await, data } from "react-router";
import { Suspense } from "react";

import { getAllBlogs } from "./queries.server";
import ListSkeleton from "~/components/list-skeleton";
import type { Route } from "../_layout.blog/+types/route";
import { Auth } from "~/lib/auth/auth.server";
import database from "~/db";

function parseDateDDMMYY(dateStr: string): Date | null {
  const [day, month, year] = dateStr.split("/");
  if (!day || !month || !year) return null;
  const fullYear = year.length === 2 ? `20${year}` : year;
  const date = new Date(Number(fullYear), Number(month) - 1, Number(day));
  return isNaN(date.getTime()) ? null : date;
}

export const meta = () => {
  return [
    { title: "Blog - Loadertsx" },
    { name: "description", content: "Thoughts on web development and building products" },
  ];
};

export function headers(_: Route.HeadersArgs) {
  return {
    "Cache-Control": "private, max-age=3600",
  };
}

export const loader = async ({ request, context }: Route.LoaderArgs) => {
  const authManager = await Auth.authManager(context.cloudflare.env.BLOG_DB);
  const session = await authManager.api.getSession({
    headers: request.headers,
  });

  console.log(session);
  console.log(session?.user);

  const db = database(context.cloudflare.env.BLOG_DB);
  const results = getAllBlogs(db);

  return data({ results });
};

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { results } = loaderData;

  return (
    <section className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
          Writing
        </p>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">Blog</h1>
        <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
          Thoughts on React, TypeScript, and the craft of building for the web.
        </p>
      </div>

      {/* Posts List */}
      <div className="space-y-1">
        <Suspense fallback={<ListSkeleton />}>
          <Await resolve={results}>
            {(results) => (
              <>
                {results?.map(
                  (post: {
                    id: string | null;
                    title: string | null;
                    date: string | null;
                    tags: string | null;
                  }) => (
                    <Link
                      key={`post-${post.id}`}
                      prefetch="intent"
                      to={`/blog/${post.id}`}
                      className="group flex items-baseline justify-between py-4 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] transition-colors"
                    >
                      <span className="font-medium group-hover:text-[var(--color-accent)] dark:group-hover:text-[var(--color-dark-accent)] transition-colors">
                        {post.title}
                      </span>
                      {post.date && (() => {
                        const parsed = parseDateDDMMYY(post.date);
                        return parsed ? (
                          <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] ml-4 shrink-0">
                            {parsed.toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  )
                )}
              </>
            )}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
