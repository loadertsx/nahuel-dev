import Markdoc, { type RenderableTreeNodes } from "@markdoc/markdoc";

const fence = {
	render: "Fence",
	attributes: {
		language: {
			type: String,
		},
	},
};

export function markdownParser(markdown: string): RenderableTreeNodes {
	return Markdoc.transform(Markdoc.parse(markdown), {
		nodes: { fence },
	});
}
