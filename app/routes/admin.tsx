import { Outlet, redirect, useFetcher } from "react-router";
import { Button } from "~/components/ui/Button";
import { Auth } from "~/lib/auth/auth.server";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import type { Route } from "./+types/admin";

export async function loader({ request, context }: Route.LoaderArgs) {
	const url = new URL(request.url);

	// Skip auth check for login page
	if (url.pathname === "/admin/login") {
		return null;
	}

	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	return null;
}

export async function action({ request, context }: Route.ActionArgs) {
	const authManager = await Auth.authManager(context.cloudflare.env.BLOG_DB);
	await authManager.api.signOut({ headers: request.headers });
	return redirect("/admin/login");
}

export default function AdminLayout() {
	const fetcher = useFetcher();

	return (
		<div>
			<header className="flex justify-between items-center py-4 mb-8">
				<h1 className="text-xl font-bold">Admin</h1>
				<fetcher.Form method="post">
					<Button variant="secondary" type="submit">
						Logout
					</Button>
				</fetcher.Form>
			</header>
			<Outlet />
		</div>
	);
}
