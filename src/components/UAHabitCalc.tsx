"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { DollarSign, BarChart, BrainCircuit, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";

import type { AiAnalysisResult } from "@/app/actions";
import { getAiAnalysis } from "@/app/actions";
import { habitFormSchema, type HabitFormValues } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "./icons";
import { Separator } from "./ui/separator";

type ExpenseSummary = {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
};

export default function UAHabitCalc() {
  const [isPending, startTransition] = useTransition();
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [expenses, setExpenses] = useState<ExpenseSummary | null>(null);
  const { toast } = useToast();

  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      habitName: "",
      costPerInstance: "",
      frequency: "daily",
    },
  });

  const costPerInstance = form.watch("costPerInstance");
  const frequency = form.watch("frequency");

  useEffect(() => {
    const cost = parseFloat(costPerInstance as any);
    if (cost && cost > 0 && frequency) {
      let daily = 0;
      switch (frequency) {
        case "daily":
          daily = cost;
          break;
        case "weekly":
          daily = cost / 7;
          break;
        case "monthly":
          daily = cost / 30.44;
          break;
      }
      setExpenses({
        daily: daily,
        weekly: daily * 7,
        monthly: daily * 30.44,
        yearly: daily * 365.25,
      });
    } else {
      setExpenses(null);
    }
  }, [costPerInstance, frequency]);

  const onSubmit = (values: HabitFormValues) => {
    setAiResult(null);
    startTransition(async () => {
      const result = await getAiAnalysis(values);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: result.error,
        });
      } else {
        setAiResult(result);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
      <header className="mb-8 flex flex-col items-center text-center">
        <Logo className="mb-4 h-16 w-16 text-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
          UAHabitCalc
        </h1>
        <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
          Посчитайте, сколько вы тратите на свои привычки и сколько могли бы сэкономить.
        </p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="h-6 w-6" />
            Ваша привычка
          </CardTitle>
          <CardDescription>
            Введите данные, чтобы рассчитать расходы.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <FormField
                control={form.control}
                name="habitName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название привычки</FormLabel>
                    <FormControl>
                      <Input placeholder="Например, кофе по утрам" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPerInstance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Стоимость (в грн)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Например, 65" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Частота</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите частоту" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Ежедневно</SelectItem>
                        <SelectItem value="weekly">Еженедельно</SelectItem>
                        <SelectItem value="monthly">Ежемесячно</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isPending} size="lg" className="w-full md:w-auto">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Анализируем...
                  </>
                ) : (
                  "Рассчитать и получить анализ"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {expenses && (
        <Card className="mb-8 animate-in fade-in-50 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart className="h-6 w-6"/>
              Сводка расходов
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-secondary/50">
                  <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">В день</CardTitle>
                      <CardDescription className="text-3xl font-bold text-foreground">{formatCurrency(expenses.daily)}</CardDescription>
                  </CardHeader>
              </Card>
              <Card className="bg-secondary/50">
                  <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">В неделю</CardTitle>
                      <CardDescription className="text-3xl font-bold text-foreground">{formatCurrency(expenses.weekly)}</CardDescription>
                  </CardHeader>
              </Card>
              <Card className="bg-secondary/50">
                  <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">В месяц</CardTitle>
                      <CardDescription className="text-3xl font-bold text-foreground">{formatCurrency(expenses.monthly)}</CardDescription>
                  </CardHeader>
              </Card>
              <Card className="bg-secondary/50">
                  <CardHeader>
                      <CardTitle className="text-sm font-medium text-muted-foreground">В год</CardTitle>
                      <CardDescription className="text-3xl font-bold text-foreground">{formatCurrency(expenses.yearly)}</CardDescription>
                  </CardHeader>
              </Card>
          </CardContent>
        </Card>
      )}

      {(isPending || aiResult) && (
        <section className="space-y-8">
            <div className="text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tight">
                <BrainCircuit className="inline-block mr-2 h-8 w-8 text-primary"/>
                Анализ сбережений от ИИ
              </h2>
              <p className="mt-1 text-muted-foreground">
                Вот что искусственный интеллект говорит о ваших потенциальных сбережениях.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2">
                {isPending ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    aiResult && !aiResult.error && (
                        <>
                            <ResultCard title="Прогноз на 1 год" totalSavings={aiResult.projection1Year?.totalSavings} reasoning={aiResult.projection1Year?.reasoning} formatCurrency={formatCurrency}/>
                            <ResultCard title="Прогноз на 5 лет" totalSavings={aiResult.projection5Years?.totalSavings} reasoning={aiResult.projection5Years?.reasoning} formatCurrency={formatCurrency}/>
                        </>
                    )
                )}
            </div>
            
            {isPending ? <SkeletonCard isFullWidth={true} /> : aiResult && !aiResult.error && aiResult.equivalentPurchases && (
                <Card className="animate-in fade-in-50 duration-700">
                    <CardHeader>
                        <CardTitle>Эквивалентные покупки</CardTitle>
                        <CardDescription>Что еще можно было бы купить на эти деньги за год?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base">{aiResult.equivalentPurchases}</p>
                    </CardContent>
                </Card>
            )}
        </section>
      )}
    </div>
  );
}

function SkeletonCard({isFullWidth = false}) {
    return (
        <Card className={isFullWidth ? "md:col-span-2" : ""}>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-10 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
            </CardContent>
        </Card>
    );
}

function ResultCard({title, totalSavings, reasoning, formatCurrency}: {title: string, totalSavings?: number, reasoning?: string, formatCurrency: (amount: number) => string}) {
    if (typeof totalSavings === 'undefined' || !reasoning) return null;

    return (
        <Card className="flex flex-col animate-in fade-in-50 duration-700">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-4xl font-bold text-primary pt-2">
                    {formatCurrency(totalSavings)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-base text-muted-foreground">{reasoning}</p>
            </CardContent>
        </Card>
    )
}
