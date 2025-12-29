import { Auth } from "./auth.server";

export async function requireAdmin(request: Request, dbEnv: D1Database) {
	const session = await Auth.getSession(request, dbEnv);


	if (!session?.user) {
		throw new Response("Not Found", { status: 404 });
	}

	return session;
}
