import { z } from "zod";

export const emailBodySchema = z.object({ email: z.email() });
export type EmailBody = z.infer<typeof emailBodySchema>;

export const magicLinkVerifyQuerySchema = z.object({
  token: z.string().min(10),
  email: z.email(),
});

export const oauthProviderParamSchema = z.object({
  provider: z.enum(["google", "github"]),
});

export const oauthCallbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});
