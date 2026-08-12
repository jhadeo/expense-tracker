import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Please include a name."),
  type: z.enum(["income", "expenses"]),
});
