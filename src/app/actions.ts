"use server";

import { equivalentPurchases } from "@/ai/flows/equivalent-purchases";
import { projectSavings } from "@/ai/flows/savings-projection";
import type { HabitFormValues } from "@/lib/schema";

function getDailyCost(costPerInstance: number, frequency: 'daily' | 'weekly' | 'monthly'): number {
  switch (frequency) {
    case 'daily':
      return costPerInstance;
    case 'weekly':
      return costPerInstance / 7;
    case 'monthly':
      return costPerInstance / 30.44; // Average days in a month
    default:
      return 0;
  }
}

export async function getAiAnalysis(data: HabitFormValues) {
  try {
    const dailyCost = getDailyCost(data.costPerInstance, data.frequency);

    const [projection1Year, projection5Years, equivalents] = await Promise.all([
      projectSavings({
        habitName: data.habitName,
        dailyCost: dailyCost,
        projectionYears: 1,
      }),
      projectSavings({
        habitName: data.habitName,
        dailyCost: dailyCost,
        projectionYears: 5,
      }),
      equivalentPurchases({
        ...data,
        timeframeYears: 1,
      }),
    ]);
    
    const equivalentPurchasesText = equivalents.equivalentPurchases;

    return {
      projection1Year,
      projection5Years,
      equivalentPurchases: equivalentPurchasesText,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return { error: "Не удалось получить анализ от ИИ. Пожалуйста, попробуйте еще раз." };
  }
}

export type AiAnalysisResult = Awaited<ReturnType<typeof getAiAnalysis>>;
