'use server';

/**
 * @fileOverview Calculates and suggests equivalent purchases based on the savings from eliminating a habit.
 *
 * - equivalentPurchases - Calculates potential savings and suggests equivalent purchases.
 * - EquivalentPurchasesInput - The input type for the equivalentPurchases function.
 * - EquivalentPurchasesOutput - The return type for the equivalentPurchases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EquivalentPurchasesInputSchema = z.object({
  habitName: z.string().describe('The name of the habit.'),
  costPerInstance: z.number().describe('The cost per instance of the habit in UAH.'),
  frequency: z.enum(['daily', 'weekly', 'monthly']).describe('The frequency of the habit.'),
  timeframeYears: z.number().describe('The timeframe in years to project savings over.'),
});
export type EquivalentPurchasesInput = z.infer<typeof EquivalentPurchasesInputSchema>;

const EquivalentPurchasesOutputSchema = z.object({
  savings: z.number().describe('The total savings in UAH over the specified timeframe.'),
  equivalentPurchases: z.string().describe('Suggestions for what the saved money could buy.'),
});
export type EquivalentPurchasesOutput = z.infer<typeof EquivalentPurchasesOutputSchema>;

export async function equivalentPurchases(input: EquivalentPurchasesInput): Promise<EquivalentPurchasesOutput> {
  return equivalentPurchasesFlow(input);
}

const equivalentPurchasesPrompt = ai.definePrompt({
  name: 'equivalentPurchasesPrompt',
  input: {schema: EquivalentPurchasesInputSchema},
  output: {schema: EquivalentPurchasesOutputSchema},
  prompt: `Вы эксперт по личным финансам, который помогает людям визуализировать преимущества отказа от вредных привычек.

  Рассчитайте общую сумму сбережений за указанный период времени, а затем предложите, что можно приобрести на эти сэкономленные деньги.

  Название привычки: {{habitName}}
  Стоимость за раз: {{costPerInstance}} UAH
  Частота: {{frequency}}
  Период времени: {{timeframeYears}} лет

  Сначала четко укажите общую сумму сбережений в формате: "Общая экономия: [сумма] UAH".
  Затем предложите, что можно купить на эти сэкономленные деньги. Приведите конкретные примеры.
  `,
});

const equivalentPurchasesFlow = ai.defineFlow(
  {
    name: 'equivalentPurchasesFlow',
    inputSchema: EquivalentPurchasesInputSchema,
    outputSchema: EquivalentPurchasesOutputSchema,
  },
  async input => {
    let instancesPerYear;
    switch (input.frequency) {
      case 'daily':
        instancesPerYear = 365;
        break;
      case 'weekly':
        instancesPerYear = 52;
        break;
      case 'monthly':
        instancesPerYear = 12;
        break;
    }
    const totalSavings = input.costPerInstance * instancesPerYear * input.timeframeYears;
    const inputWithSavings = {...input, totalSavings};
    const {output} = await equivalentPurchasesPrompt(inputWithSavings);
    output!.savings = totalSavings;
    return output!;
  }
);
