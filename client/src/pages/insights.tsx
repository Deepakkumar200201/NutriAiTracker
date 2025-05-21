import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

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

export default function Insights() {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const { data: calorieData = [], isLoading: isLoadingCalories } = useQuery<CalorieData[]>({
    queryKey: ["/api/stats/calories", period],
  });

  const { data: macroData = [], isLoading: isLoadingMacros } = useQuery<MacroData[]>({
    queryKey: ["/api/stats/macros", period],
  });

  const renderCalorieChart = () => {
    if (isLoadingCalories) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!calorieData || calorieData.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={calorieData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="hsl(var(--primary))"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke="#8884d8"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderMacroChart = () => {
    if (isLoadingMacros) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!macroData || macroData.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          No data available
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={macroData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="protein"
            name="Protein (g)"
            fill="hsl(var(--chart-1))"
          />
          <Bar
            dataKey="carbs"
            name="Carbs (g)"
            fill="hsl(var(--chart-2))"
          />
          <Bar
            dataKey="fat"
            name="Fat (g)"
            fill="hsl(var(--chart-3))"
          />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const calculateAverage = (data: any[], key: string): number => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, day) => sum + (day[key] || 0), 0) / data.length;
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Insights</h1>
        <p className="text-gray-600">
          Track your nutrition data and spot trends over time
        </p>
      </div>

      <div className="mb-6">
        <Tabs
          defaultValue="week"
          onValueChange={(value) => setPeriod(value as any)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Calorie Intake
            </h2>
            <div className="h-[300px]">
              {renderCalorieChart()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Macronutrient Distribution
            </h2>
            <div className="h-[300px]">
              {renderMacroChart()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Nutrition Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {isLoadingCalories ? (
                  <div className="animate-pulse h-10 w-20 bg-gray-200 rounded mx-auto"></div>
                ) : (
                  Math.round(calculateAverage(calorieData, 'calories'))
                )}
              </div>
              <div className="text-gray-600">Avg. Daily Calories</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-[#F59E0B] mb-2">
                {isLoadingMacros ? (
                  <div className="animate-pulse h-10 w-20 bg-gray-200 rounded mx-auto"></div>
                ) : (
                  Math.round(calculateAverage(macroData, 'protein'))
                )}
              </div>
              <div className="text-gray-600">Avg. Daily Protein (g)</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold text-[#10B981] mb-2">
                {isLoadingMacros ? (
                  <div className="animate-pulse h-10 w-20 bg-gray-200 rounded mx-auto"></div>
                ) : (
                  Math.round(calculateAverage(macroData, 'water'))
                )}
              </div>
              <div className="text-gray-600">Avg. Water (glasses)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
