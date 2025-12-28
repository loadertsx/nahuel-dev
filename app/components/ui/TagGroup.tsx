import { XIcon } from "lucide-react";
import React, { createContext, useContext } from "react";
import {
	Tag as AriaTag,
	TagGroup as AriaTagGroup,
	type TagGroupProps as AriaTagGroupProps,
	type TagProps as AriaTagProps,
	Button,
	composeRenderProps,
	TagList,
	type TagListProps,
	Text,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { tv } from "tailwind-variants";
import { Description, Label } from "./Field";
import { focusRing } from "./utils";

const colors = {
	default:
		"bg-[var(--color-border)] dark:bg-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border-transparent",
	accent:
		"bg-[var(--color-accent)]/10 dark:bg-[var(--color-dark-accent)]/10 text-[var(--color-accent)] dark:text-[var(--color-dark-accent)] border-[var(--color-accent)]/20 dark:border-[var(--color-dark-accent)]/20",
	surface:
		"bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)] text-[var(--color-text)] dark:text-[var(--color-dark-text)] border-[var(--color-border)] dark:border-[var(--color-dark-border)]",
};

type Color = keyof typeof colors;
const ColorContext = createContext<Color>("default");

const tagStyles = tv({
	extend: focusRing,
	base: "transition cursor-default text-xs rounded-full border px-3 py-1 flex items-center max-w-fit gap-1",
	variants: {
		color: {
			default: "",
			accent: "",
			surface: "",
		},
		allowsRemoving: {
			true: "pr-1",
		},
		isSelected: {
			true: "bg-[var(--color-text)] dark:bg-[var(--color-dark-text)] text-[var(--color-bg)] dark:text-[var(--color-dark-bg)] border-transparent forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-color-adjust-none",
		},
		isDisabled: {
			true: "opacity-40",
		},
	},
	compoundVariants: (Object.keys(colors) as Color[]).map((color) => ({
		isSelected: false,
		color,
		class: colors[color],
	})),
});

export interface TagGroupProps<T>
	extends Omit<AriaTagGroupProps, "children">,
		Pick<TagListProps<T>, "items" | "children" | "renderEmptyState"> {
	color?: Color;
	label?: string;
	description?: string;
	errorMessage?: string;
}

export interface TagProps extends AriaTagProps {
	color?: Color;
}

export function TagGroup<T extends object>({
	label,
	description,
	errorMessage,
	items,
	children,
	renderEmptyState,
	...props
}: TagGroupProps<T>) {
	return (
		<AriaTagGroup
			{...props}
			className={twMerge("flex flex-col gap-1", props.className)}
		>
			<Label>{label}</Label>
			<ColorContext.Provider value={props.color || "default"}>
				<TagList
					items={items}
					renderEmptyState={renderEmptyState}
					className="flex flex-wrap gap-1.5"
				>
					{children}
				</TagList>
			</ColorContext.Provider>
			{description && <Description>{description}</Description>}
			{errorMessage && (
				<Text slot="errorMessage" className="text-sm text-red-600">
					{errorMessage}
				</Text>
			)}
		</AriaTagGroup>
	);
}

const removeButtonStyles = tv({
	extend: focusRing,
	base: "cursor-default rounded-full transition-[background-color] p-0.5 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 pressed:bg-black/20 dark:pressed:bg-white/20",
});

export function Tag({ children, color, ...props }: TagProps) {
	let textValue = typeof children === "string" ? children : undefined;
	let groupColor = useContext(ColorContext);
	return (
		<AriaTag
			textValue={textValue}
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tagStyles({ ...renderProps, className, color: color || groupColor }),
			)}
		>
			{({ allowsRemoving }) => (
				<>
					{children}
					{allowsRemoving && (
						<Button slot="remove" className={removeButtonStyles}>
							<XIcon aria-hidden className="w-3 h-3" />
						</Button>
					)}
				</>
			)}
		</AriaTag>
	);
}
