import type { MetaFunction } from "react-router";
import { PlateIntro } from "~/components/alchemy/ornament";
import { projects } from "~/content/projects";
import CardProject from "./components/card-project";

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
				{projects.map((project, index) => (
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
