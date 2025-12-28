import type { MetaFunction } from "react-router";
import CardProject from "./components/card-project";

const projectsItems = [
  {
    title: "Treefy",
    content:
      "Organize your ideas, share your knowledge, and grow your understanding with Treefy.",
    deployLink: "https://treefy.pages.dev/",
    codeLink: "https://github.com/Nahuelluca20/treefy",
    tags: ["Remix", "Cloudflare", "KV"],
  },
  {
    title: "RAG LLM System",
    content:
      "A RAG system using an LLM that responds according to the user's questions.",
    deployLink: "https://loadertsx.com/blog/how-create-rag-system",
    codeLink: "https://github.com/Nahuelluca20/ollama-techstacks-api",
    tags: ["Python", "FastAPI", "LLMs", "Ollama"],
  },
  {
    title: "Trello clone",
    content:
      "Trello clone using remix, you can create boards and tasks like Trello.",
    deployLink: "https://trello-clone-zeta-wheat.vercel.app/",
    codeLink: "https://github.com/Nahuelluca20/trello-clone",
    tags: ["Remix", "Prisma", "Supabase"],
  },
  {
    title: "WhosIn?",
    content:
      "WhosIn is an app to create events and have your friends confirm their presence.",
    deployLink: "https://whos-in-sage.vercel.app/",
    codeLink: "https://github.com/Nahuelluca20/WhosIn-",
    tags: ["Next.js", "Prisma", "Clerk"],
  },
  {
    title: "Hacker News Clone",
    content:
      "Hacker News mini clone, you can see the latest stories and access comments.",
    deployLink: "https://hackernews-remix-clone.netlify.app/",
    codeLink: "https://github.com/Nahuelluca20/hacker-news-remix-clone",
    tags: ["Remix", "TailwindCSS", "API"],
  },
  {
    title: "React Flag API App",
    content:
      "An app made with react that consumes the flag-api API to display the countries and their data.",
    deployLink: "https://react-flag-api.netlify.app/",
    codeLink: "https://github.com/Nahuelluca20/react-flag-API",
    tags: ["React", "React Router", "API"],
  },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Projects - Loadertsx" },
    { name: "description", content: "A selection of projects I've built" },
  ];
};

export default function Projects() {
  return (
    <section className="max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
          Selected Work
        </p>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">Projects</h1>
        <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
          A collection of products and experiments I've built. Each one taught
          me something new about crafting better software.
        </p>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
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
