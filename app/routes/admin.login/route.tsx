import { data, Form, redirect, useActionData } from "react-router";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { Auth } from "~/lib/auth/auth.server";
import type { Route } from "./+types/route";

export function meta() {
	return [{ name: "robots", content: "noindex, nofollow" }];
}

export async function loader({ request, context }: Route.LoaderArgs) {
	const session = await Auth.getSession(
		request,
		context.cloudflare.env.BLOG_DB,
	);
	if (session?.user) {
		throw redirect("/admin/blogpost");
	}

	return null;
}

export async function action({ request, context }: Route.ActionArgs) {
	const formData = await request.formData();
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return data({ error: "Email and password are required" }, { status: 400 });
	}

	const result = await Auth.signInEmail(
		request,
		context.cloudflare.env.BLOG_DB,
		email,
		password,
	);

	if (!result || result.error) {
		return data({ error: "Invalid credentials" }, { status: 401 });
	}

	// Extract ALL Set-Cookie headers from the result
	const headers = new Headers();
	const cookies = result.headers?.getSetCookie?.() || [];
	for (const cookie of cookies) {
		headers.append("Set-Cookie", cookie);
	}

	return redirect("/admin/blogpost", { headers });
}

export default function AdminLogin() {
	const actionData = useActionData<typeof action>();
	const error = actionData?.error;

	return (
		<section className="flex flex-col items-center justify-center min-h-[60vh]">
			<div className="w-full max-w-[400px] space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold">Admin Login</h1>
				</div>
				<Form method="post" className="space-y-4">
					{error && (
						<div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
							{error}
						</div>
					)}
					<TextField
						label="Email"
						name="email"
						type="email"
						isRequired
						autoComplete="email"
					/>
					<TextField
						label="Password"
						name="password"
						type="password"
						isRequired
						autoComplete="current-password"
					/>
					<Button type="submit" className="w-full">
						Sign In
					</Button>
				</Form>
			</div>
		</section>
	);
}
