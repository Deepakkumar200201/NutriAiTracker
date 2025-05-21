import { Card } from "@/components/ui/card";
import { Meal } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
}

export default function MealCard({ meal }: MealCardProps) {
  const mealTime = new Date(meal.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const determineTimeOfDay = (): string => {
    const hour = new Date(meal.timestamp).getHours();
    if (hour >= 5 && hour < 11) return "Breakfast";
    if (hour >= 11 && hour < 15) return "Lunch";
    if (hour >= 15 && hour < 19) return "Dinner";
    return "Snack";
  };

  return (
    <Card className="overflow-hidden">
      <img
        src={meal.imageUrl}
        alt={meal.description}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-center text-xs text-gray-500 mb-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-3 h-3 mr-1"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          <span>{formatDate(new Date(meal.timestamp))}</span>
          <span className="mx-2">•</span>
          <span>{determineTimeOfDay()}</span>
        </div>
        <h3 className="font-medium text-gray-900 mb-2">{meal.description}</h3>
        <div className="flex items-center text-sm mb-3">
          <div className="flex items-center mr-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="w-4 h-4 mr-1 text-primary"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 14.5c0 .828 5.373 1.5 12 1.5s12-.672 12-1.5S24.627 13 18 13s-12 .672-12 1.5Z" />
              <path d="M30 14.5c0 .6-4.935 1.091-11.122 1.09-6.187 0-10.878-.476-10.878-1.09-.067-.145 0-7.5 0-7.5C8 4 11.254 2.5 18 2.5s10 1.5 10 4.5c.021 0 .021 7.5 0 7.5Z" />
              <path d="M18 7c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3" />
            </svg>
            <span className="font-semibold">{meal.calories}</span>
            <span className="text-gray-500 text-xs ml-1">cal</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              P: {meal.protein}g
            </span>
            <span className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] rounded-full text-xs">
              C: {meal.carbs}g
            </span>
            <span className="px-2 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs">
              F: {meal.fat}g
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
