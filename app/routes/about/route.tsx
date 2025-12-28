import MePNG from "/me.png?url";
import type { Route } from "../about/+types/route";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "About - Loadertsx" },
    { name: "description", content: "About Loadertsx - Software Developer" },
  ];
};

export default function About() {
  return (
    <section className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
          About
        </p>
        <h1 className="text-3xl md:text-4xl font-serif">
          A bit about me
        </h1>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {/* Intro with image */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-6 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
            <p>
              Hello! I'm Loader, a software developer passionate about building
              products that people love to use. I believe in the craft of
              software development—writing code that's not just functional, but
              elegant and maintainable.
            </p>
            <p>
              My expertise lies in the modern web stack: React, TypeScript,
              Next.js, and Remix. I use Tailwind CSS to style my work with both
              precision and efficiency. Beyond the frontend, I enjoy working
              with databases and APIs, currently favoring tools like Supabase
              and Cloudflare's edge platform.
            </p>
          </div>
          <img
            className="hidden md:block w-40 h-40 rounded-lg object-cover border border-[var(--color-border)] dark:border-[var(--color-dark-border)]"
            src={MePNG}
            alt="Loader"
          />
        </div>

        {/* Philosophy */}
        <div className="pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
          <h2 className="font-serif text-xl mb-4">My approach</h2>
          <div className="space-y-4 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
            <p>
              I care deeply about the details. Every interaction, every
              transition, every piece of feedback matters. Good software should
              feel invisible—it should work so naturally that users don't have
              to think about it.
            </p>
            <p>
              When I build products, I think about the person on the other side
              of the screen. What do they need? What might frustrate them? How
              can I make their experience just a little bit better?
            </p>
          </div>
        </div>

        {/* Current focus */}
        <div className="pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
          <h2 className="font-serif text-xl mb-4">Currently</h2>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
            I'm exploring the edges of what's possible on the web—from edge
            computing to AI integrations, from real-time collaboration to
            offline-first applications. The web platform keeps evolving, and
            I'm excited to evolve with it.
          </p>
        </div>
      </div>
    </section>
  );
}
