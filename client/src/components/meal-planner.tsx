import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ChefHat, Calendar, Heart } from "lucide-react";

interface MealPlanDay {
  day: string;
  breakfast: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    instructions: string;
  };
  lunch: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    instructions: string;
  };
  dinner: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    instructions: string;
  };
  snack: {
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    instructions: string;
  };
}

export default function MealPlanner() {
  const [activePeriod, setActivePeriod] = useState<string>("meal-plan");
  const [days, setDays] = useState<number>(3);
  const { toast } = useToast();
  
  // Query for meal plan
  const { data: mealPlanData, isLoading: mealPlanLoading, error: mealPlanError, refetch: refetchMealPlan } = 
    useQuery({
      queryKey: ['/api/meal-plan', days],
      queryFn: async () => {
        const response = await fetch(`/api/meal-plan?days=${days}`);
        if (!response.ok) {
          throw new Error('Failed to fetch meal plan');
        }
        return response.json();
      },
      enabled: false,
    });
  
  // Query for nutritional advice
  const { data: adviceData, isLoading: adviceLoading, error: adviceError, refetch: refetchAdvice } = 
    useQuery({
      queryKey: ['/api/nutritional-advice'],
      queryFn: async () => {
        const response = await fetch('/api/nutritional-advice');
        if (!response.ok) {
          throw new Error('Failed to fetch nutritional advice');
        }
        return response.json();
      },
      enabled: false,
    });
  
  const generateMealPlan = async () => {
    try {
      await refetchMealPlan();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getAdvice = async () => {
    try {
      await refetchAdvice();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get nutritional advice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatMealPlanText = (text: string) => {
    // Format the text with proper line breaks and emphasis
    return text
      .split('\n\n')
      .map((paragraph, i) => (
        <p key={i} className="mb-4">
          {paragraph.split('\n').map((line, j) => (
            <React.Fragment key={j}>
              {line.startsWith('# ') ? (
                <h2 className="text-xl font-bold mt-6 mb-2">{line.replace('# ', '')}</h2>
              ) : line.startsWith('## ') ? (
                <h3 className="text-lg font-semibold mt-4 mb-2">{line.replace('## ', '')}</h3>
              ) : line.startsWith('### ') ? (
                <h4 className="text-md font-medium mt-3 mb-1">{line.replace('### ', '')}</h4>
              ) : line.startsWith('- ') ? (
                <li className="ml-4">{line.replace('- ', '')}</li>
              ) : line.includes(':') && !line.startsWith('*') ? (
                <div className="flex">
                  <span className="font-semibold mr-2">{line.split(':')[0]}:</span>
                  <span>{line.split(':').slice(1).join(':')}</span>
                </div>
              ) : (
                line
              )}
              <br />
            </React.Fragment>
          ))}
        </p>
      ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-4">
      <Tabs value={activePeriod} onValueChange={setActivePeriod} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="meal-plan" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            <span>Meal Plan</span>
          </TabsTrigger>
          <TabsTrigger value="advice" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span>Nutritional Advice</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="meal-plan" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">AI-Powered Meal Plan</CardTitle>
              <CardDescription>
                Get personalized meal suggestions based on your dietary history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {days} day{days > 1 ? 's' : ''} meal plan
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDays(Math.max(1, days - 1))}
                  >
                    -
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDays(Math.min(7, days + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              {mealPlanLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-full h-24" />
                  <Skeleton className="w-full h-24" />
                  <Skeleton className="w-full h-24" />
                </div>
              ) : mealPlanData && 'success' in mealPlanData && mealPlanData.success ? (
                <div className="prose prose-sm max-w-none">
                  {formatMealPlanText(mealPlanData.mealPlan as string)}
                </div>
              ) : mealPlanError ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 mb-2">Failed to generate meal plan</p>
                  <p className="text-sm text-muted-foreground">
                    {mealPlanError instanceof Error 
                      ? mealPlanError.message 
                      : "Please try again later"}
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="mb-2">Generate a personalized meal plan based on your dietary history.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI analyzes your past meals to suggest balanced, nutritious options.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={generateMealPlan}
                disabled={mealPlanLoading}
              >
                {mealPlanLoading ? "Generating..." : "Generate Meal Plan"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advice" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Nutritional Advice</CardTitle>
              <CardDescription>
                Get personalized advice based on your eating patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {adviceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-full h-24" />
                  <Skeleton className="w-full h-24" />
                </div>
              ) : adviceData && 'success' in adviceData && adviceData.success ? (
                <div className="prose prose-sm max-w-none">
                  {formatMealPlanText(adviceData.advice as string)}
                </div>
              ) : adviceError ? (
                <div className="p-4 text-center">
                  <p className="text-red-500 mb-2">Failed to generate nutritional advice</p>
                  <p className="text-sm text-muted-foreground">
                    {adviceError instanceof Error 
                      ? adviceError.message 
                      : "Please try again later"}
                  </p>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="mb-2">Get personalized nutritional insights based on your meal history.</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Our AI analyzes your eating patterns to provide tailored advice for a balanced diet.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={getAdvice}
                disabled={adviceLoading}
              >
                {adviceLoading ? "Analyzing..." : "Get Nutritional Advice"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}