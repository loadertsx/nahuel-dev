import { Outlet } from "react-router";
import database from "~/db";
import { getTopics } from "./_layout.notes._index/queries.server";
import type { Route } from "./+types/_layout.notes";

export async function loader({ context }: Route.LoaderArgs) {
  const db = database(context.cloudflare.env.BLOG_DB);
  const topics = await getTopics(db);
  return { topics };
}

export default function NotesLayout({ loaderData }: Route.ComponentProps) {
  return <Outlet context={{ topics: loaderData.topics }} />;
}
