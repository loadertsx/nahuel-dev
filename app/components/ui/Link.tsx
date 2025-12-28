import {
	Link as AriaLink,
	type LinkProps as AriaLinkProps,
	composeRenderProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { focusRing } from "./utils";

interface LinkProps extends AriaLinkProps {
	variant?: "primary" | "secondary";
}

const styles = tv({
	extend: focusRing,
	base: "underline disabled:no-underline disabled:cursor-default forced-colors:disabled:text-[GrayText] transition rounded",
	variants: {
		variant: {
			primary:
				"text-[var(--color-accent)] dark:text-[var(--color-dark-accent)] underline decoration-[var(--color-accent)]/40 hover:decoration-[var(--color-accent)] dark:decoration-[var(--color-dark-accent)]/40 dark:hover:decoration-[var(--color-dark-accent)]",
			secondary:
				"text-[var(--color-text)] dark:text-[var(--color-dark-text)] underline decoration-[var(--color-text-secondary)]/40 hover:decoration-[var(--color-text)] dark:decoration-[var(--color-dark-text-secondary)]/40 dark:hover:decoration-[var(--color-dark-text)]",
		},
	},
	defaultVariants: {
		variant: "primary",
	},
});

export function Link(props: LinkProps) {
	return (
		<AriaLink
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				styles({ ...renderProps, className, variant: props.variant }),
			)}
		/>
	);
}
