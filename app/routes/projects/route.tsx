import type { MetaFunction } from "react-router";
import { PlateIntro } from "~/components/alchemy/ornament";
import CardProject from "./components/card-project";

const projectsItems = [
	{
		title: "The Rime of the Ancient Mariner",
		content:
			"A pi package that gives the pi coding agent a memory: persistent SQLite-backed knowledge, typed session summaries, a searchable memory library and a read-only plan mode.",
		codeLink: "https://github.com/loadertsx/the-rime-of-the-ancient-mariner",
		tags: ["TypeScript", "pi", "SQLite", "Drizzle"],
	},
	{
		title: "Treefy",
		content:
			"Organize your ideas, share your knowledge, and grow your understanding with Treefy.",
		deployLink: "https://treefy.pages.dev/",
		codeLink: "https://github.com/loadertsx/treefy",
		tags: ["Remix", "Cloudflare", "KV"],
	},
	{
		title: "RAG LLM System",
		content:
			"A RAG system using an LLM that responds according to the user's questions.",
		deployLink: "https://loadertsx.com/blog/how-create-rag-system",
		codeLink: "https://github.com/loadertsx/ollama-techstacks-api",
		tags: ["Python", "FastAPI", "LLMs", "Ollama"],
	},
	{
		title: "Trello clone",
		content:
			"Trello clone using remix, you can create boards and tasks like Trello.",
		deployLink: "https://trello-clone-zeta-wheat.vercel.app/",
		codeLink: "https://github.com/loadertsx/trello-clone",
		tags: ["Remix", "Prisma", "Supabase"],
	},
	{
		title: "Notion MCP",
		content:
			"A lightweight MCP server that lets AI assistants work inside a Notion workspace: search and read pages, create new ones and write documentation from markdown.",
		codeLink: "https://github.com/loadertsx/notion-mcp",
		tags: ["Python", "MCP", "Notion API"],
	},
	{
		title: "Hacker News Clone",
		content:
			"Hacker News mini clone, you can see the latest stories and access comments.",
		deployLink: "https://hackernews-remix-clone.netlify.app/",
		codeLink: "https://github.com/loadertsx/hacker-news-remix-clone",
		tags: ["Remix", "TailwindCSS", "API"],
	},
];

export const handle = { plate: "Plate III · Transmutations" };

export const meta: MetaFunction = () => {
	return [
		{ title: "Projects - Loadertsx" },
		{ name: "description", content: "A selection of projects I've built" },
	];
};

export default function Projects() {
	return (
		<section className="pb-8">
			<PlateIntro
				fig="Fig. III"
				label="Selected Work"
				title="The"
				titleItalic="Transmutations."
				lede="A collection of products and experiments I've built. Each one taught me something new about crafting better software."
				note="— nothing is gained without sacrifice"
			/>
			<div className="grid gap-5 md:gap-7 md:grid-cols-2">
				{projectsItems.map((project, index) => (
					<CardProject
						key={project.title}
						title={project.title}
						content={project.content}
						deployLink={project.deployLink}
						codeLink={project.codeLink}
						tags={project.tags}
						index={index}
					/>
				))}
			</div>
		</section>
	);
}
