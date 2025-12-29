import { Auth } from "~/lib/auth/auth.server";
import type { Route } from "../api.auth.$/+types/route";

export async function loader({ request, context }: Route.LoaderArgs) {
	const authManager = await Auth.authManager(context.cloudflare.env.BLOG_DB);
	return authManager.handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
	const authManager = await Auth.authManager(context.cloudflare.env.BLOG_DB);
	return authManager.handler(request);
}
