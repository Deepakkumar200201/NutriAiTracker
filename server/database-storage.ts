import { 
  type Meal, 
  type InsertMeal,
  type User,
  type InsertUser
} from "@shared/schema";
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, subMonths } from 'date-fns';
import { IStorage } from "./storage";
import { prisma } from "./db";

interface CalorieData {
  date: string;
  calories: number;
  target: number;
}

interface MacroData {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

export class DatabaseStorage implements IStorage {
  // Meal methods
  async createMeal(mealData: InsertMeal): Promise<Meal> {
    return prisma.meal.create({
      data: mealData
    });
  }

  async getMeals(period: string): Promise<Meal[]> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);
    
    if (period === 'all') {
      return prisma.meal.findMany({
        orderBy: { timestamp: 'desc' }
      });
    }
    
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
    
    return prisma.meal.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });
  }
  
  async getRecentMeals(): Promise<Meal[]> {
    return prisma.meal.findMany({
      orderBy: { timestamp: 'desc' },
      take: 3
    });
  }
  
  async getTodayMeals(): Promise<Meal[]> {
    const now = new Date();
    const startOfToday = startOfDay(now);
    const endOfToday = endOfDay(now);
    
    return prisma.meal.findMany({
      where: {
        timestamp: {
          gte: startOfToday,
          lte: endOfToday
        }
      },
      orderBy: { timestamp: 'desc' }
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
    
    // Get all meals in the period
    const periodMeals = await prisma.meal.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endOfDay(now)
        }
      }
    });
    
    // Generate dataset for the specified period
    for (let i = 0; i < daysToInclude; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      if (date > now) break; // Don't include future dates
      
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Find meals for this day
      const dayMeals = periodMeals.filter(meal => {
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
    
    // Get all meals in the period
    const periodMeals = await prisma.meal.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endOfDay(now)
        }
      }
    });
    
    // Generate dataset for the specified period
    for (let i = 0; i < daysToInclude; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      if (date > now) break; // Don't include future dates
      
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      // Find meals for this day
      const dayMeals = periodMeals.filter(meal => {
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
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return prisma.user.create({
      data: insertUser
    });
  }

  async getDetailedReport(userId: number, period: string = 'month'): Promise<any> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);
    
    // Determine the date range based on period
    switch (period) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case '3months':
        startDate = subMonths(startOfMonth(now), 3);
        break;
      case '6months':
        startDate = subMonths(startOfMonth(now), 6);
        break;
      default:
        startDate = startOfMonth(now);
    }

    // Get all meals in the period
    const meals = await prisma.meal.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    // Calculate overall statistics
    const totalMeals = meals.length;
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0);

    // Calculate daily averages
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const avgCaloriesPerDay = totalCalories / daysInPeriod;
    const avgProteinPerDay = totalProtein / daysInPeriod;
    const avgCarbsPerDay = totalCarbs / daysInPeriod;
    const avgFatPerDay = totalFat / daysInPeriod;

    // Calculate meal frequency
    const mealsPerDay = totalMeals / daysInPeriod;

    // Calculate macro distribution
    const totalMacros = totalProtein + totalCarbs + totalFat;
    const proteinPercentage = (totalProtein / totalMacros) * 100;
    const carbsPercentage = (totalCarbs / totalMacros) * 100;
    const fatPercentage = (totalFat / totalMacros) * 100;

    // Get top meals by calories
    const topMealsByCalories = [...meals]
      .sort((a, b) => b.calories - a.calories)
      .slice(0, 5)
      .map(meal => ({
        description: meal.description,
        calories: meal.calories,
        timestamp: meal.timestamp,
        macros: {
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat
        }
      }));

    // Calculate daily trends
    const dailyTrends = [];
    for (let i = 0; i < daysInPeriod; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      if (date > now) break;

      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.timestamp);
        return mealDate >= dayStart && mealDate <= dayEnd;
      });

      const dayCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const dayProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
      const dayCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
      const dayFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);

      dailyTrends.push({
        date: format(date, 'MMM dd'),
        calories: dayCalories,
        macros: {
          protein: dayProtein,
          carbs: dayCarbs,
          fat: dayFat
        },
        mealCount: dayMeals.length
      });
    }

    return {
      period,
      dateRange: {
        start: format(startDate, 'MMM dd, yyyy'),
        end: format(endDate, 'MMM dd, yyyy')
      },
      summary: {
        totalMeals,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        avgCaloriesPerDay,
        avgProteinPerDay,
        avgCarbsPerDay,
        avgFatPerDay,
        mealsPerDay,
        macroDistribution: {
          protein: proteinPercentage.toFixed(1),
          carbs: carbsPercentage.toFixed(1),
          fat: fatPercentage.toFixed(1)
        }
      },
      topMealsByCalories,
      dailyTrends,
      recommendations: this.generateRecommendations({
        avgCaloriesPerDay,
        avgProteinPerDay,
        avgCarbsPerDay,
        avgFatPerDay,
        mealsPerDay
      })
    };
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];
    
    // Calorie recommendations
    if (stats.avgCaloriesPerDay < 1500) {
      recommendations.push("Your daily calorie intake is quite low. Consider increasing your food intake to meet your energy needs.");
    } else if (stats.avgCaloriesPerDay > 3000) {
      recommendations.push("Your daily calorie intake is high. Consider monitoring portion sizes and choosing more nutrient-dense foods.");
    }

    // Protein recommendations
    if (stats.avgProteinPerDay < 50) {
      recommendations.push("Your protein intake is low. Consider adding more protein-rich foods to your diet.");
    }

    // Meal frequency recommendations
    if (stats.mealsPerDay < 3) {
      recommendations.push("You're eating fewer than 3 meals per day. Consider spreading your food intake across more meals for better energy levels.");
    } else if (stats.mealsPerDay > 6) {
      recommendations.push("You're eating more than 6 meals per day. Consider consolidating your meals to better manage portion sizes.");
    }

    // Macro balance recommendations
    const proteinPercentage = (stats.avgProteinPerDay * 4) / stats.avgCaloriesPerDay * 100;
    const carbsPercentage = (stats.avgCarbsPerDay * 4) / stats.avgCaloriesPerDay * 100;
    const fatPercentage = (stats.avgFatPerDay * 9) / stats.avgCaloriesPerDay * 100;

    if (proteinPercentage < 15) {
      recommendations.push("Your protein intake is below recommended levels. Aim for 15-30% of calories from protein.");
    }
    if (carbsPercentage < 45) {
      recommendations.push("Your carbohydrate intake is low. Consider adding more complex carbohydrates to your diet.");
    }
    if (fatPercentage < 20) {
      recommendations.push("Your fat intake is low. Include healthy fats in your diet for optimal health.");
    }

    return recommendations;
  }

  private calculateAverage(data: any[], key: string): number {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, day) => sum + (day[key] || 0), 0) / data.length;
  }
}