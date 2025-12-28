import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient({
	baseURL: "http://localhost:5173",
});

export const { signIn, signUp, signOut } = authClient;
