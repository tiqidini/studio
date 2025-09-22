import { z } from "zod";

export const habitFormSchema = z.object({
  habitName: z.string().min(2, {
    message: "Название должно содержать не менее 2 символов.",
  }),
  costPerInstance: z.coerce.number().min(0.01, {
    message: "Стоимость должна быть положительным числом.",
  }),
  frequency: z.enum(["daily", "weekly", "monthly"], {
    required_error: "Необходимо выбрать частоту.",
  }),
});

export type HabitFormValues = z.infer<typeof habitFormSchema>;
