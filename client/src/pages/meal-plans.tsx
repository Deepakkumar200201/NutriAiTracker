import { useState } from "react";
import MealPlanner from "@/components/meal-planner";
import { Separator } from "@/components/ui/separator";

export default function MealPlans() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Meal Plans</h1>
        <p className="text-muted-foreground text-center mb-4">
          AI-powered meal plans based on your dietary history and nutritional needs
        </p>
        <Separator className="w-full mb-6" />
      </div>

      <MealPlanner />
    </div>
  );
}