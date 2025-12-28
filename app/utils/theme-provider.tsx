import { createContext, useContext, useEffect, useState } from "react";

export enum Theme {
	LIGHT = "light",
	DARK = "dark",
}

type ThemeContextType = [Theme, (theme: Theme) => void];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "theme-preference";

function getInitialTheme(): Theme {
	if (typeof window === "undefined") return Theme.LIGHT;

	const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

	if (storedTheme && Object.values(Theme).includes(storedTheme)) {
		return storedTheme;
	}

	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? Theme.DARK
		: Theme.LIGHT;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);

	const setTheme = (newTheme: Theme) => {
		setThemeState(newTheme);
		localStorage.setItem(THEME_STORAGE_KEY, newTheme);

		const html = document.querySelector("html");
		if (html) {
			html.classList.remove(Theme.LIGHT, Theme.DARK);
			html.classList.add(newTheme);
			html.style.colorScheme = newTheme;
		}
	};

	useEffect(() => {
		const html = document.querySelector("html");
		if (html) {
			html.classList.remove(Theme.LIGHT, Theme.DARK);
			html.classList.add(theme);
			html.style.colorScheme = theme;
		}
	}, [theme]);

	return (
		<ThemeContext.Provider value={[theme, setTheme]}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
}
