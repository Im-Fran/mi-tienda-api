import { z } from "zod";

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(120),
    avatarUrl: z.url(),
  })
  .partial();
