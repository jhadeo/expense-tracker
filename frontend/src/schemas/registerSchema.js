import { z } from "zod";

export const registerSchema = z
  .object({
    first_name: z.string().trim().min(1, "First name is required."),

    last_name: z.string().trim().min(1, "Last name is required."),

    email: z
      .email("Please enter a valid email address.")
      .trim()
      .min(1, "Email is required."),
      
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character.",
      ),

    password_confirmation: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });
