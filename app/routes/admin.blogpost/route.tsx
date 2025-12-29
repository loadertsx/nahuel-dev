import { Label, TextArea } from "react-aria-components";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/Button";
import { TextField } from "~/components/ui/TextField";
import { requireAdmin } from "~/lib/auth/require-admin.server";
import type { Route } from "./+types/route";

export async function loader({ request, context }: Route.LoaderArgs) {
	await requireAdmin(request, context.cloudflare.env.BLOG_DB);
	return null;
}

export default function Blogpost() {
	const fetcher = useFetcher();
	return (
		<section>
			<div className="space-y-2">
				<h1 className="text-5xl max-w-[800px]">Add a new blogpost</h1>
				<h2 className="text-xl text-[#535661] dark:text-[#a9adc1] font-medium">
					Add a new blogpost to the database
				</h2>
			</div>
			<div className="mt-8">
				<fetcher.Form method="post" className="max-w-[500px] space-y-4">
					<div className="md:flex md:gap-4 w-full">
						<TextField label="id" name="id" />
						<TextField label="Title" name="title" />
					</div>
					<div className="md:flex md:gap-4">
						<TextField label="Tags" name="tags" />
						<TextField label="Date" name="date" />
					</div>

					<div className="flex flex-col gap-1">
						<Label>Description</Label>
						<TextArea className="border-2 rounded-md py-3 px-4" />
					</div>
					<Button type="submit">Add</Button>
				</fetcher.Form>
			</div>
		</section>
	);
}
