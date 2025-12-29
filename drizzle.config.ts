import type { Config } from "drizzle-kit";

export default {
	out: "./drizzle",
	schema: "./app/db/schemas/*",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		databaseId: "545d95a0-c5d4-4324-a411-a896e7e2d1f8",
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
		token: process.env.CLOUDFLARE_TOKEN || "",
	},
} satisfies Config;
