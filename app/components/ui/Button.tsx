import {
	composeRenderProps,
	Button as RACButton,
	type ButtonProps as RACButtonProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { focusRing } from "./utils";

export interface ButtonProps extends RACButtonProps {
	variant?: "primary" | "secondary" | "ghost" | "accent" | "icon";
}

const button = tv({
	extend: focusRing,
	base: "px-5 py-2.5 text-sm font-medium tracking-wide text-center transition-all duration-200 rounded-full cursor-default",
	variants: {
		variant: {
			primary:
				"bg-[var(--color-text)] dark:bg-[var(--color-dark-text)] text-[var(--color-bg)] dark:text-[var(--color-dark-bg)] hover:opacity-90 pressed:opacity-80",
			secondary:
				"border border-[var(--color-border-strong)] dark:border-[var(--color-dark-border-strong)] hover:border-[var(--color-text)] dark:hover:border-[var(--color-dark-text)] pressed:bg-[var(--color-surface)] dark:pressed:bg-[var(--color-dark-surface)]",
			ghost:
				"hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-dark-surface)] pressed:bg-[var(--color-border)] dark:pressed:bg-[var(--color-dark-border)]",
			accent:
				"bg-[var(--color-accent)] dark:bg-[var(--color-dark-accent)] text-white dark:text-[var(--color-dark-bg)] hover:bg-[var(--color-accent-hover)] dark:hover:bg-[var(--color-dark-accent-hover)] pressed:opacity-90",
			icon: "border-0 p-1.5 flex items-center justify-center text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-dark-surface)] pressed:bg-[var(--color-border)] dark:pressed:bg-[var(--color-dark-border)]",
		},
		isDisabled: {
			true: "opacity-40 cursor-not-allowed",
		},
	},
	defaultVariants: {
		variant: "primary",
	},
});

export function Button(props: ButtonProps) {
	return (
		<RACButton
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				button({ ...renderProps, variant: props.variant, className }),
			)}
		/>
	);
}
