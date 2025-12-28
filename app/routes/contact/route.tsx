import { Mail, Github, Linkedin, ArrowUpRight } from "lucide-react";
import type { Route } from "../contact/+types/route";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Contact - Loadertsx" },
    { name: "description", content: "Get in touch with Loader" },
  ];
};

const contactLinks = [
  {
    icon: Mail,
    label: "Email",
    value: "nahueldevelop@gmail.com",
    href: "mailto:nahueldevelop@gmail.com",
    description: "Best for project inquiries",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "@Nahuelluca20",
    href: "https://github.com/Nahuelluca20",
    description: "See my open source work",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "nahueldevelop",
    href: "https://www.linkedin.com/in/nahueldevelop/",
    description: "Let's connect professionally",
  },
];

export default function Contact() {
  return (
    <section className="max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-12">
        <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] mb-3">
          Contact
        </p>
        <h1 className="text-3xl md:text-4xl font-serif mb-4">
          Let's work together
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] leading-relaxed">
          I'm always open to new opportunities, collaborations, or just a good
          conversation about building products.
        </p>
      </div>

      {/* Contact Links */}
      <div className="space-y-4">
        {contactLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto") ? undefined : "_blank"}
            rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
            className="group flex items-center justify-between p-5 rounded-lg border border-[var(--color-border)] dark:border-[var(--color-dark-border)] hover:border-[var(--color-border-strong)] dark:hover:border-[var(--color-dark-border-strong)] transition-all duration-200 hover:shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-full bg-[var(--color-surface)] dark:bg-[var(--color-dark-surface)]">
                <link.icon className="w-5 h-5 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]" />
              </div>
              <div>
                <p className="font-medium">{link.label}</p>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
                  {link.description}
                </p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)] group-hover:text-[var(--color-accent)] dark:group-hover:text-[var(--color-dark-accent)] transition-colors" />
          </a>
        ))}
      </div>

      {/* Response note */}
      <div className="mt-12 pt-8 border-t border-[var(--color-border)] dark:border-[var(--color-dark-border)]">
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text-secondary)]">
          I typically respond within a few days. Looking forward to hearing from
          you.
        </p>
      </div>
    </section>
  );
}
