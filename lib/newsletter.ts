import { z } from "zod";

export const newsletterEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export type NewsletterEmailInput = z.infer<typeof newsletterEmailSchema>;
