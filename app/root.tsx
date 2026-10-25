import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import Footer from "./components/footer";
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

const FONTS =
	"https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Symbols&family=Pinyon+Script&display=swap";

export const links = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{ rel: "preload", as: "style", href: FONTS },
	{ rel: "stylesheet", href: FONTS },
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
					<div className="plate relative isolate min-h-screen">
						<div className="max-w-[1440px] mx-auto flex flex-col min-h-screen">
							<Header openMenu={openMenu} setOpenMenu={setOpenMenu} />
							<main className="flex-1 px-6 md:px-14 xl:px-[120px]">
								{children}
							</main>
							<Footer />
						</div>
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
