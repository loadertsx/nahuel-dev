import { Await, data, Link, useSearchParams, useOutletContext } from "react-router";
import { getNotes } from "./queries.server";
import database from "~/db";
import type { Route } from "./+types/route";
import { Tab, TabList, Tabs } from "~/components/ui/Tabs";
import { Suspense } from "react";
import ListSkeleton from "~/components/list-skeleton";

type OutletContext = {
  topics: Array<{ id: string; title: string }>;
};

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const topic = url.searchParams.get("topic");
  const db = database(context.cloudflare.env.BLOG_DB);
  const notes = await getNotes(db, topic || "");

  return data({ topic, notes });
}

export const meta: Route.MetaFunction = ({ matches }) => {
  const parentData = matches.find((m) => m?.id === "routes/_layout.notes")?.data as
    | { topics: Array<{ title: string }> }
    | undefined;
  const topics = parentData?.topics || [];

  return [
    { title: "Notes - Loadertsx" },
    {
      name: "description",
      content: topics.map((topic) => topic.title).join(", "),
    },
  ];
};

export default function Notes({ loaderData }: Route.ComponentProps) {
  const { notes } = loaderData;
  const { topics } = useOutletContext<OutletContext>();
  const [_, setSearchParams] = useSearchParams();

  return (
    <section className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
          Knowledge Base
        </p>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">Notes</h1>
        <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
          Quick references and learnings organized by topic.
        </p>
      </div>

      {/* Topics Tabs */}
      <Tabs
        onSelectionChange={(key) => {
          setSearchParams({ topic: key.toString() });
        }}
        className="mb-8"
      >
        <TabList className="flex gap-2 flex-wrap">
          {topics.map((topic) => (
            <Tab
              key={topic.id}
              id={topic.id}
              className="px-4 py-2 text-sm font-medium rounded-full border border-[var(--color-border)] dark:border-[var(--color-dark-border)] cursor-pointer transition-all duration-200 hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] data-[selected]:bg-[var(--color-text)] dark:data-[selected]:bg-[var(--color-dark-text)] data-[selected]:text-[var(--color-bg)] dark:data-[selected]:text-[var(--color-dark-bg)] data-[selected]:border-transparent"
            >
              {topic.title}
            </Tab>
          ))}
        </TabList>
      </Tabs>

      {/* Notes List */}
      <div className="space-y-1">
        <Suspense fallback={<ListSkeleton />}>
          <Await resolve={notes}>
            {(notes) => (
              <>
                {notes?.map(
                  (note: { id: string | null; title: string | null }) => (
                    <Link
                      key={`note-${note.id}`}
                      prefetch="intent"
                      to={`/notes/${note.id}`}
                      className="group flex items-baseline justify-between py-4 border-b border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] transition-colors"
                    >
                      <span className="font-medium group-hover:text-[var(--color-accent)] dark:group-hover:text-[var(--color-dark-accent)] transition-colors">
                        {note.title}
                      </span>
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
