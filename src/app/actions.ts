"use server";

import type { HabitFormValues } from "@/lib/schema";
import type { EquivalentPurchasesOutput } from "@/ai/flows/equivalent-purchases";
import type { SavingsProjectionOutput } from "@/ai/flows/savings-projection";


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

    const projection1Year: SavingsProjectionOutput = {
      totalSavings: dailyCost * 365,
      reasoning: "За год вы могли бы купить новый смартфон или совершить короткое путешествие.",
    };

    const projection5Years: SavingsProjectionOutput = {
      totalSavings: dailyCost * 365 * 5,
      reasoning: "За 5 лет вы могли бы накопить на первоначальный взнос за квартиру или купить хороший подержанный автомобиль.",
    };

    const equivalents: EquivalentPurchasesOutput = {
      savings: data.costPerInstance * (data.frequency === 'daily' ? 365 : data.frequency === 'weekly' ? 52 : 12),
      equivalentPurchases: "На эти деньги можно было бы купить несколько новых книг или оплатить годовую подписку на стриминговый сервис.",
    };

    return {
      projection1Year,
      projection5Years,
      equivalentPurchases: equivalents.equivalentPurchases,
    };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return { error: "Не удалось получить анализ. Пожалуйста, попробуйте еще раз." };
  }
}

export type AiAnalysisResult = Awaited<ReturnType<typeof getAiAnalysis>>;