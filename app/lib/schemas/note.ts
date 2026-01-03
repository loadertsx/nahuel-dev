import { z } from "zod";

export const noteSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Title is required")
		.max(200, "Title too long"),
	topicId: z.string().min(1, "Topic is required"),
	content: z.string().default(""),
	status: z.enum(["draft", "published"]).default("draft"),
});

export type NoteFormData = z.infer<typeof noteSchema>;
