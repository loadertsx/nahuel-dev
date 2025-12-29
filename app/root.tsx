import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import Header from "./components/header";
import "./app.css";
import {
	isRouteErrorResponse,
	Links,
	Meta,
	Navigate,
	Outlet,
	Scripts,
	ScrollRestoration,
} from "react-router";
import type { Route } from "./+types/root";
import { ThemeProvider } from "./utils/theme-provider";

export const links = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "preload",
		as: "style",
		href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Outfit:wght@300;400;500;600;700&display=swap",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Outfit:wght@300;400;500;600;700&display=swap",
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	const [openMenu, setOpenMenu] = useState(false);

	useEffect(() => {
		if (document.fonts) {
			document.fonts.ready.then(() => {
				document.documentElement.classList.add("fonts-loaded");
			});
		} else {
			document.documentElement.classList.add("fonts-loaded");
		}
	}, []);

	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body
				className={twMerge(
					"overflow-x-hidden font-sans",
					openMenu ? "overflow-hidden max-h-screen" : "overflow-x-hidden",
				)}
			>
				<ThemeProvider>
					<Header openMenu={openMenu} setOpenMenu={setOpenMenu} />
					<div className="max-w-[1280px] mx-auto mt-10 px-5 lg:px-[100px]">
						{children}
					</div>
				</ThemeProvider>
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	// Redirect 404 errors to the custom 404 page
	if (isRouteErrorResponse(error) && error.status === 404) {
		return <Navigate to="/404" replace />;
	}

	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = "Error";
		details = error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
