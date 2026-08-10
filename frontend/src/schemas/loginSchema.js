import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),

  password: z.string().min(1, "Please enter your password."),
});
