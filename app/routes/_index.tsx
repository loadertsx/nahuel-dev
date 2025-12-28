import { Link } from "react-router";
import { ArrowRight, Github, Linkedin, Mail } from "lucide-react";

import type { Route } from "./+types/_index";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Loadertsx - Software Developer" },
    {
      name: "description",
      content:
        "Software developer crafting thoughtful web experiences. Building products with React, TypeScript, and modern web technologies.",
    },
  ];
};

export default function Index() {
  return (
    <section className="min-h-[70vh] flex flex-col justify-center py-12 md:py-20">
      {/* Hero */}
      <div className="space-y-6 max-w-2xl">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          Software Developer
        </p>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] tracking-tight">
          Building products
          <br />
          <span className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
            with intention
          </span>
        </h1>

        <p className="text-lg md:text-xl text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed max-w-xl">
          I craft web experiences that feel natural and work beautifully.
          Currently focused on React, TypeScript, and the modern web platform.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10">
        <Link
          to="/projects"
          viewTransition
          className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide bg-[var(--color-text)] dark:bg-[var(--color-dark-text)] text-[var(--color-bg)] dark:text-[var(--color-dark-bg)] rounded-full transition-all duration-300 hover:gap-3"
        >
          View my work
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          to="/blog"
          viewTransition
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium tracking-wide border border-[var(--color-border-strong)] dark:border-[var(--color-dark-border-strong)] rounded-full transition-all duration-300 hover:border-[var(--color-text)] dark:hover:border-[var(--color-dark-text)]"
        >
          Read the blog
        </Link>
      </div>

      {/* Social Links */}
      <div className="flex items-center gap-6 mt-16 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
        <span className="text-xs font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          Connect
        </span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/Nahuelluca20"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/nahueldevelop/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          <a
            href="mailto:nahueldevelop@gmail.com"
            className="p-2 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] hover:text-[var(--color-text)] dark:hover:text-[var(--color-dark-text)] transition-colors"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Decorative element */}
      <div className="hidden lg:block absolute right-[10%] top-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-[var(--color-border-strong)] dark:via-[var(--color-dark-border-strong)] to-transparent" />
    </section>
  );
}
