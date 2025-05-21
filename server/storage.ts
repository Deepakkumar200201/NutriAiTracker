import { 
  meals,
  type Meal, 
  type InsertMeal,
  type User,
  type InsertUser, 
  users
} from "@shared/schema";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

export interface IStorage {
  createMeal(meal: InsertMeal): Promise<Meal>;
  getMeals(period: string): Promise<Meal[]>;
  getRecentMeals(): Promise<Meal[]>;
  getTodayMeals(): Promise<Meal[]>;
  getCalorieStats(period: string): Promise<any[]>;
  getMacroStats(period: string): Promise<any[]>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meals: Map<number, Meal>;
  private currentUserId: number;
  private currentMealId: number;

  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.currentUserId = 1;
    this.currentMealId = 1;
  }

  // Meal methods
  async createMeal(mealData: InsertMeal): Promise<Meal> {
    const id = this.currentMealId++;
    const meal: Meal = { ...mealData, id };
    this.meals.set(id, meal);
    return meal;
  }

  async getMeals(period: string): Promise<Meal[]> {
    const allMeals = Array.from(this.meals.values());
    
    // Sort by timestamp descending (newest first)
    const sortedMeals = allMeals.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (period === 'all') {
      return sortedMeals;
    }
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);
    
    switch (period) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      default:
        startDate = startOfDay(now);
    }
    
    return sortedMeals.filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= startDate && mealDate <= endDate;
    });
  }
  
  async getRecentMeals(): Promise<Meal[]> {
    const allMeals = Array.from(this.meals.values());
    
    // Sort by timestamp descending (newest first)
    const sortedMeals = allMeals.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Return only the 3 most recent meals
    return sortedMeals.slice(0, 3);
  }
  
  async getTodayMeals(): Promise<Meal[]> {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);
    
    return Array.from(this.meals.values()).filter(meal => {
      const mealDate = new Date(meal.timestamp);
      return mealDate >= startOfToday && mealDate <= endOfToday;
    });
  }
  
  async getCalorieStats(period: string): Promise<any[]> {
    const now = new Date();
    let startDate: Date;
    let daysToInclude: number;
    
    if (period === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      daysToInclude = 7;
    } else {
      startDate = startOfMonth(now);
      daysToInclude = 30;
    }
    
    const stats: any[] = [];
    
    // Generate dataset for the specified period
    for (let i = 0; i < daysToInclude; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      if (date > now) break; // Don't include future dates
      
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Find meals for this day
      const dayMeals = Array.from(this.meals.values()).filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });
      
      // Calculate total calories for the day
      const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      
      stats.push({
        date: format(date, 'MMM dd'),
        calories: totalCalories,
        target: 2100 // Default target
      });
    }
    
    return stats;
  }
  
  async getMacroStats(period: string): Promise<any[]> {
    const now = new Date();
    let startDate: Date;
    let daysToInclude: number;
    
    if (period === 'week') {
      startDate = startOfWeek(now, { weekStartsOn: 1 });
      daysToInclude = 7;
    } else {
      startDate = startOfMonth(now);
      daysToInclude = 30;
    }
    
    const stats: any[] = [];
    
    // Generate dataset for the specified period
    for (let i = 0; i < daysToInclude; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      if (date > now) break; // Don't include future dates
      
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Find meals for this day
      const dayMeals = Array.from(this.meals.values()).filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });
      
      // Calculate total macros for the day
      const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const totalFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);
      
      stats.push({
        date: format(date, 'MMM dd'),
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat,
        water: Math.floor(Math.random() * 5) + 3 // Mock data for water intake
      });
    }
    
    return stats;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

import { DatabaseStorage } from "./database-storage";

// Comment out the MemStorage and use DatabaseStorage instead
// export const storage = new MemStorage();
export const storage = new DatabaseStorage();
