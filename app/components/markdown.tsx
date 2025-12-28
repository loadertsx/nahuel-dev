import type { RenderableTreeNodes } from "@markdoc/markdoc";

import markdoc from "@markdoc/markdoc";
import prism from "prismjs";
import * as React from "react";
import "prismjs/components/prism-python";

type Props = {
	content: RenderableTreeNodes;
};

const { renderers } = markdoc;

export function Fence({
	children,
	language,
}: {
	children: React.ReactNode;
	language: string;
}) {
	return (
		<pre key={language}>
			<code className={`language-${language}`}>{children}</code>
		</pre>
	);
}

function Callout({ children }: { children: React.ReactNode }) {
	return <div className="callout">{children}</div>;
}

export function MarkdownView({ content }: Props) {
	React.useEffect(() => {
		prism.highlightAll();
	});
	return (
		<>
			{renderers.react(content, React, {
				components: { Fence, Callout },
			})}
		</>
	);
}
