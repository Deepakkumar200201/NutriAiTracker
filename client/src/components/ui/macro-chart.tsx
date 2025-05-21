import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface MacroChartProps {
  type: "protein" | "carbs" | "fat";
  value: number;
  maxValue?: number;
  className?: string;
  label?: string;
  percentage?: number;
}

export function MacroChart({
  type,
  value,
  maxValue = 100,
  className,
  label,
  percentage,
}: MacroChartProps) {
  const [offset, setOffset] = useState(339.292);
  const chartColors = {
    protein: "protein-chart",
    carbs: "carbs-chart",
    fat: "fat-chart",
  };

  const displayLabels = {
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
  };

  // Calculate percentage if not provided
  const calculatedPercentage = percentage ?? Math.round((value / maxValue) * 100);
  
  // Calculate stroke-dashoffset based on percentage
  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(339.292 * (1 - calculatedPercentage / 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [calculatedPercentage]);

  return (
    <div className={cn("bg-gray-50 rounded-lg p-4 text-center", className)}>
      <div className="flex flex-col items-center">
        <div className="macro-chart circle-animation">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle
              className="macro-chart-circle macro-chart-bg"
              cx="60"
              cy="60"
              r="54"
              strokeDasharray="339.292"
              strokeDashoffset="0"
            ></circle>
            <circle
              className={`macro-chart-circle ${chartColors[type]}`}
              cx="60"
              cy="60"
              r="54"
              strokeDasharray="339.292"
              strokeDashoffset={offset}
            ></circle>
          </svg>
          <div className="macro-chart-text">
            <div 
              className={cn(
                "text-2xl font-bold",
                type === "protein" && "text-primary",
                type === "carbs" && "text-[#F59E0B]",
                type === "fat" && "text-[#10B981]"
              )}
            >
              {value}
            </div>
            <div className="text-xs text-gray-500">grams</div>
          </div>
        </div>
        <div className="mt-2">
          <h4 className="font-medium text-gray-900">{label || displayLabels[type]}</h4>
          <p className="text-sm text-gray-500">{calculatedPercentage}% of total calories</p>
        </div>
      </div>
    </div>
  );
}
