import { z } from "zod";

export const CommentValidator = z.object({
  postId: z.number(),
  text: z.string().min(1, { message: "Title must contain atleast 1 character" }),
  replyToId: z.number().optional(),
});

export type CommentCreationRequest = z.infer<typeof CommentValidator>;
