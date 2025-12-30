import { z } from "zod";

export const topicSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
});

export type TopicFormData = z.infer<typeof topicSchema>;
