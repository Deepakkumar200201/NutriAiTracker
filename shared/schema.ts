import { z } from "zod";
import { Prisma } from "@prisma/client";

// Food analysis schema
export const mealAnalysisSchema = z.object({
  description: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

export type MealAnalysis = z.infer<typeof mealAnalysisSchema>;

// Database schema types
export type Meal = Prisma.MealGetPayload<{}>;
export type User = Prisma.UserGetPayload<{}>;

// Insert schemas
export const insertMealSchema = z.object({
  description: z.string(),
  imageUrl: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  timestamp: z.date().optional(),
  userId: z.number(),
});

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertMeal = z.infer<typeof insertMealSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
