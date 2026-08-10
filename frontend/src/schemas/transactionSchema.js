import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(1, "Please include a title."),
  amount: z.coerce.number().min(1, "Minimum amount is 1."),
  date: z.string().min(1, "Please select a date."),
  category_id: z.coerce
    .number()
    .int("Please select a valid category.")
    .positive("Please select a valid category."),
});
