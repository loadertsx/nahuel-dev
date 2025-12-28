import {
	composeRenderProps,
	Tab as RACTab,
	TabList as RACTabList,
	TabPanel as RACTabPanel,
	Tabs as RACTabs,
	type TabListProps,
	type TabPanelProps,
	type TabProps,
	type TabsProps,
} from "react-aria-components";
import { tv } from "tailwind-variants";
import { focusRing } from "./utils";

const tabsStyles = tv({
	base: "flex gap-4",
	variants: {
		orientation: {
			horizontal: "flex-col",
			vertical: "flex-row w-[800px]",
		},
	},
});

export function Tabs(props: TabsProps) {
	return (
		<RACTabs
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabsStyles({ ...renderProps, className }),
			)}
		/>
	);
}

const tabListStyles = tv({
	base: "flex gap-2 flex-wrap",
	variants: {
		orientation: {
			horizontal: "flex-row",
			vertical: "flex-col items-start",
		},
	},
});

export function TabList<T extends object>(props: TabListProps<T>) {
	return (
		<RACTabList
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabListStyles({ ...renderProps, className }),
			)}
		/>
	);
}

const tabProps = tv({
	extend: focusRing,
	base: "flex items-center cursor-default rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 forced-color-adjust-none border",
	variants: {
		isSelected: {
			false:
				"text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)]",
			true: "text-[var(--color-bg)] dark:text-[var(--color-dark-bg)] bg-[var(--color-text)] dark:bg-[var(--color-dark-text)] border-transparent forced-colors:text-[HighlightText] forced-colors:bg-[Highlight]",
		},
		isDisabled: {
			true: "opacity-40 cursor-not-allowed",
		},
	},
});

export function Tab(props: TabProps) {
	return (
		<RACTab
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabProps({ ...renderProps, className }),
			)}
		/>
	);
}

const tabPanelStyles = tv({
	extend: focusRing,
	base: "flex-1 p-4 text-sm text-[var(--color-text)] dark:text-[var(--color-dark-text)]",
});

export function TabPanel(props: TabPanelProps) {
	return (
		<RACTabPanel
			{...props}
			className={composeRenderProps(props.className, (className, renderProps) =>
				tabPanelStyles({ ...renderProps, className }),
			)}
		/>
	);
}
