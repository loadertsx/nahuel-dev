# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Development Server:**
```bash
bun run dev          # Start React Router dev server with Wrangler (http://127.0.0.1:8788)
```

**Build & Deploy:**
```bash
bun run build        # Build for production
bun run preview      # Build and preview locally
bun run deploy       # Build and deploy to Cloudflare Pages
```

**Type Checking:**
```bash
bun run typecheck    # Run full type check (includes Cloudflare and React Router typegen)
bun run cf-typegen   # Generate Cloudflare Worker types
bun run rr:typegen   # Generate React Router types
```

**Database Operations:**
```bash
bun run db:generate            # Generate Drizzle migrations
bun run db:migrate             # Apply migrations locally
bun run db:migrate-production  # Apply migrations to production
bun run drizzle:local          # Open local Drizzle Studio
bun run drizzle:production     # Open production Drizzle Studio
```

**Code Quality:**
```bash
bunx biome check              # Run linter and formatter
bunx biome check --fix        # Auto-fix issues
```

## Architecture Overview

This is a **React Router v7** application deployed on **Cloudflare Pages** with the following stack:

- **Frontend:** React 19, React Router v7 with file-based routing
- **Styling:** TailwindCSS v4, React Aria Components for accessibility
- **Database:** Drizzle ORM with Cloudflare D1 (SQLite)
- **Authentication:** Better Auth
- **Content:** Markdoc for blog posts/notes
- **Code Quality:** Biome for linting and formatting

### Key Architecture Patterns

**File Structure:**
- `/app/routes/` - File-based routing (React Router v7)
- `/app/components/ui/` - Reusable UI components with React Aria Components
- `/app/db/schemas/` - Database schema definitions
- `/app/utils/` - Shared utilities (theme provider, etc.)

**Database Schema:**
The app uses Drizzle ORM with these main entities:
- `posts` - Blog posts
- `notes` - Personal notes system
- `topics` - Note categorization
- `noteRelations` - Note relationships
- Auth tables (`user`, `session`, `account`, `verification`)

**Routing System:**
Uses React Router v7 file-based routing with nested routes:
- Static routes: `/about`, `/contact`, `/projects` (prerendered)
- Dynamic routes: `/blog/$slug`, `/notes/$slug`
- Admin routes: `/admin.blogpost`
- Layout routes: `_layout.blog` for shared layouts

**Theme System:**
- Light/dark theme support with `ThemeProvider`
- Persisted in localStorage
- CSS custom properties for theming

**UI Components:**
- Built on React Aria Components for accessibility
- Tailwind Variants for styling variations
- Focus ring utilities for keyboard navigation

### Development Workflow

1. **Database Changes:**
   - Modify schemas in `/app/db/schemas/`
   - Run `bun run db:generate` to create migration
   - Apply with `bun run db:migrate`

2. **Adding Routes:**
   - Create files in `/app/routes/` following naming conventions
   - Use `route.tsx` for route components
   - Nested routes use folder structure

3. **Cloudflare Integration:**
   - Environment bindings configured in `wrangler.toml`
   - D1 database binding as `BLOG_DB`
   - Uses Cloudflare Workers environment

4. **Type Safety:**
   - Always run `bun run typecheck` before commits
   - React Router generates route types automatically
   - Cloudflare types generated from `wrangler.toml`

5. **Code Quality:**
   - Use Biome as the linter and formatter for this project
   - Run `bunx biome check --fix` to auto-fix linting and formatting issues
   - Always format code with Biome before committing