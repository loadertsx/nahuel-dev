import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import db from "~/db";
export class Auth {
	constructor(private readonly dbEnv: D1Database) {}

	static async authManager(dbEnv: D1Database) {
		return betterAuth({
			database: drizzleAdapter(db(dbEnv), { provider: "sqlite" }),
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
			headers: request.headers,
			body: {
				email,
				password,
			},
		});
	}
}
