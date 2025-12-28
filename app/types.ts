export interface Env {
	BLOG_DB: D1Database;
}

export interface Post {
	id: number;
	date: string;
	title: string;
	content: string;
	tags: string;
}
