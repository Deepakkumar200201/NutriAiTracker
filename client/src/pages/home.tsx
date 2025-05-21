import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ImageUpload from "@/components/image-upload";
import NutritionResults from "@/components/nutrition-results";
import DailySummary from "@/components/daily-summary";
import MealCard from "@/components/meal-card";
import { Meal, MealAnalysis } from "@shared/schema";
import { Link } from "wouter";

export default function Home() {
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const { data: recentMeals = [] } = useQuery<Meal[]>({
    queryKey: ["/api/meals/recent"],
  });

  const handleAnalysisComplete = (result: any) => {
    setAnalysis(result.analysis);
    setUploadedImageUrl(result.imageUrl);
  };

  const handleReset = () => {
    setAnalysis(null);
    setUploadedImageUrl(null);
  };

  return (
    <>
      {!analysis ? (
        <ImageUpload onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        <NutritionResults
          analysis={analysis}
          imageUrl={uploadedImageUrl!}
          onReset={handleReset}
        />
      )}

      <DailySummary />

      <section className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Meals</h2>
          <Link href="/history">
            <div className="text-primary font-medium text-sm hover:text-primary-600 cursor-pointer">
              View All
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentMeals.length > 0 ? (
            recentMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <div className="bg-gray-50 rounded-lg p-8">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
                  <line x1="6" x2="18" y1="17" y2="17" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No meals logged yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Use the image upload tool above to analyze and log your first meal.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
