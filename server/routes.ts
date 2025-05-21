import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { analyzeImage } from "./gemini";
import { generateMealPlan, getNutritionalAdvice } from "./anthropic";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { mealAnalysisSchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { promisify } from "util";

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "uploads");
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
  
  // Analyze food image endpoint
  app.post("/api/analyze", upload.single("image"), async (req: Request, res: Response) => {
    try {
      const file = req.file as Express.Multer.File;
      if (!file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({ 
          message: "Invalid file type. Only JPEG and PNG images are allowed." 
        });
      }
      
      // Save file to disk with unique name
      const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname || ".jpg")}`;
      const filePath = path.join(uploadsDir, filename);
      
      await fs.writeFile(filePath, file.buffer);
      
      // Get the public URL for the image
      const imageUrl = `/uploads/${filename}`;
      
      // Analyze image with Gemini API
      const analysisResult = await analyzeImage(file.buffer);
      
      // Validate the analysis result with Zod
      const validatedAnalysis = mealAnalysisSchema.parse(analysisResult);
      
      // Return the analysis results and image URL
      res.json({
        analysis: validatedAnalysis,
        imageUrl
      });
    } catch (error) {
      console.error("Analysis error:", error);
      
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(422).json({ 
          message: "Invalid analysis result", 
          errors: validationError.details 
        });
      }
      
      res.status(500).json({ 
        message: "Error analyzing image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Serve uploaded images
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  
  // Create a new meal entry
  app.post("/api/meals", async (req: Request, res: Response) => {
    try {
      const meal = req.body;
      const newMeal = await storage.createMeal(meal);
      res.status(201).json(newMeal);
    } catch (error) {
      res.status(500).json({ 
        message: "Error creating meal", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get all meals
  app.get("/api/meals", async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as string) || "all";
      const meals = await storage.getMeals(period);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ 
        message: "Error retrieving meals", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get recent meals (last 3)
  app.get("/api/meals/recent", async (req: Request, res: Response) => {
    try {
      const meals = await storage.getRecentMeals();
      res.json(meals);
    } catch (error) {
      res.status(500).json({ 
        message: "Error retrieving recent meals", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get meals for today
  app.get("/api/meals/today", async (req: Request, res: Response) => {
    try {
      const meals = await storage.getTodayMeals();
      res.json(meals);
    } catch (error) {
      res.status(500).json({ 
        message: "Error retrieving today's meals", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get calorie stats
  app.get("/api/stats/calories", async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as string) || "week";
      const stats = await storage.getCalorieStats(period);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: "Error retrieving calorie stats", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get macro stats
  app.get("/api/stats/macros", async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as string) || "week";
      const stats = await storage.getMacroStats(period);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ 
        message: "Error retrieving macro stats", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get AI-powered meal plan recommendations
  app.get("/api/meal-plan", async (req: Request, res: Response) => {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ 
          message: "Anthropic API key not configured. Please add your API key in the settings."
        });
      }

      const days = Number(req.query.days) || 3;
      const period = (req.query.period as string) || "month";
      
      // Get meal history
      const meals = await storage.getMeals(period);
      
      if (meals.length === 0) {
        return res.status(400).json({ 
          message: "No meal history found. Please log some meals before generating a meal plan."
        });
      }

      // Generate meal plan with Claude
      const mealPlan = await generateMealPlan(meals, days);
      res.json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ 
        message: "Error generating meal plan", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get AI-powered nutritional advice
  app.get("/api/nutritional-advice", async (req: Request, res: Response) => {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(400).json({ 
          message: "Anthropic API key not configured. Please add your API key in the settings."
        });
      }

      const period = (req.query.period as string) || "month";
      
      // Get meal history
      const meals = await storage.getMeals(period);
      
      if (meals.length === 0) {
        return res.status(400).json({ 
          message: "No meal history found. Please log some meals before requesting nutritional advice."
        });
      }

      // Generate nutritional advice with Claude
      const advice = await getNutritionalAdvice(meals);
      res.json(advice);
    } catch (error) {
      console.error("Error generating nutritional advice:", error);
      res.status(500).json({ 
        message: "Error generating nutritional advice", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}
