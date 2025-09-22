'use server';

/**
 * @fileOverview Projects potential savings over user-specified future periods based on eliminating a habit.
 *
 * - projectSavings - A function that projects potential savings.
 * - SavingsProjectionInput - The input type for the projectSavings function.
 * - SavingsProjectionOutput - The return type for the projectSavings function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SavingsProjectionInputSchema = z.object({
  habitName: z.string().describe('The name of the habit.'),
  dailyCost: z.number().describe('The daily cost of the habit in UAH.'),
  projectionYears: z.number().describe('The number of years to project savings for (e.g., 1 or 5).'),
});
export type SavingsProjectionInput = z.infer<typeof SavingsProjectionInputSchema>;

const SavingsProjectionOutputSchema = z.object({
  totalSavings: z.number().describe('The total projected savings in UAH over the specified period.'),
  reasoning: z.string().describe('Specific examples of what the user could purchase with the projected savings.'),
});
export type SavingsProjectionOutput = z.infer<typeof SavingsProjectionOutputSchema>;

export async function projectSavings(input: SavingsProjectionInput): Promise<SavingsProjectionOutput> {
  return projectSavingsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'savingsProjectionPrompt',
  input: {
    schema: SavingsProjectionInputSchema,
  },
  output: {
    schema: SavingsProjectionOutputSchema,
  },
  prompt: `You are a financial advisor helping users understand the potential savings from eliminating a habit.
  The user wants to know how much money they could save over {{projectionYears}} years if they quit their habit of {{habitName}}, which costs them {{dailyCost}} UAH per day.

  Calculate the total savings in UAH and provide specific examples of what they could buy with that money in Ukraine.
  Format the savings as a number and include the UAH currency.

  Example: With 50000 UAH, you could purchase a used car, a new refrigerator, or several weekend getaways.

  Provide reasoning and examples of purchases that are relevant to the Ukrainian economy.
  Be conversational and encouraging.
  \n  Return the total savings as totalSavings.
  Return the reasoning about potential purchases as the reasoning parameter.\n`,
});

const projectSavingsFlow = ai.defineFlow(
  {
    name: 'projectSavingsFlow',
    inputSchema: SavingsProjectionInputSchema,
    outputSchema: SavingsProjectionOutputSchema,
  },
  async input => {
    const totalSavings = input.dailyCost * 365 * input.projectionYears;
    const {
      output,
    } = await prompt({
      ...input,
      totalSavings,
    });
    return output!;
  }
);
