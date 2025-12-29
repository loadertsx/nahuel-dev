import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "~/db";
export class Auth {
	constructor(readonly _dbEnv: D1Database) {}

	static async authManager(dbEnv: D1Database) {
		return betterAuth({
			database: drizzleAdapter(db(dbEnv), { provider: "sqlite" }),
			trustedOrigins: [
				"http://localhost:5173",
				"http://127.0.0.1:8788",
				"https://loadertsx.com",
			],
			session: {
				expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
				updateAge: 60 * 60 * 24, // Refresh session daily
			},
			emailAndPassword: {
				enabled: true,
				disableSignUp: true,
				maxPasswordLength: 100,
				minPasswordLength: 8,
			},
		});
	}

	static async getSession(request: Request, dbEnv: D1Database) {
		const authManager = await Auth.authManager(dbEnv);
		return authManager.api.getSession({
			headers: request.headers,
		});
	}

	static async signInEmail(
		request: Request,
		dbEnv: D1Database,
		email: string,
		password: string,
	) {
		const authManager = await Auth.authManager(dbEnv);
		return authManager.api.signInEmail({
		  returnHeaders: true,
			body: {
				email,
				password,
			},
			headers: request.headers,
		});
	}
}
