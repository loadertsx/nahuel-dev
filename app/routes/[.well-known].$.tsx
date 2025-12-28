import type { Route } from "./+types/[.well-known].$";

export function loader({ params }: Route.LoaderArgs) {
	// Handle .well-known requests that don't have specific routes
	const splat = params["*"];

	// For Chrome DevTools and other unknown .well-known requests, return 404
	return new Response("Not Found", {
		status: 404,
		headers: {
			"Content-Type": "text/plain",
		},
	});
}
