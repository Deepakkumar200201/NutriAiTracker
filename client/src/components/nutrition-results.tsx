import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MacroChart } from "@/components/ui/macro-chart";
import { useMutation } from "@tanstack/react-query";
import { MealAnalysis } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface NutritionResultsProps {
  analysis: MealAnalysis;
  imageUrl: string;
  onReset: () => void;
}

export default function NutritionResults({
  analysis,
  imageUrl,
  onReset,
}: NutritionResultsProps) {
  const { toast } = useToast();
  
  const saveMealMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/meals", {
        ...analysis,
        imageUrl,
        timestamp: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals"] });
      toast({
        title: "Meal saved!",
        description: "Your meal has been saved to your journal.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving meal",
        description: `${error}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveMeal = () => {
    saveMealMutation.mutate();
  };

  return (
    <section className="mb-8 slide-up">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="sm:w-1/3 flex-shrink-0">
              <img
                src={imageUrl}
                alt="Analyzed meal"
                className="w-full h-auto rounded-lg object-cover shadow-sm"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {analysis.description}
              </h2>
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4 mr-1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>{formatDate(new Date())}</span>
                <span className="mx-2">•</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  className="w-4 h-4 mr-1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>
                  {new Date().toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      className="w-4 h-4 text-primary"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 14.5c0 .828 5.373 1.5 12 1.5s12-.672 12-1.5S24.627 13 18 13s-12 .672-12 1.5Z" />
                      <path d="M30 14.5c0 .6-4.935 1.091-11.122 1.09-6.187 0-10.878-.476-10.878-1.09-.067-.145 0-7.5 0-7.5C8 4 11.254 2.5 18 2.5s10 1.5 10 4.5c.021 0 .021 7.5 0 7.5Z" />
                      <path d="M18 7c-3.866 0-7-1.343-7-3s3.134-3 7-3 7 1.343 7 3" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Total Calories</h3>
                </div>
                <div className="ml-10">
                  <div className="text-3xl font-bold">{analysis.calories}</div>
                  <div className="text-sm text-gray-500">calories</div>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-4">Macronutrients</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MacroChart
                  type="protein"
                  value={analysis.protein}
                  percentage={Math.round((analysis.protein * 4 / analysis.calories) * 100)}
                />
                <MacroChart
                  type="carbs"
                  value={analysis.carbs}
                  percentage={Math.round((analysis.carbs * 4 / analysis.calories) * 100)}
                />
                <MacroChart
                  type="fat"
                  value={analysis.fat}
                  percentage={Math.round((analysis.fat * 9 / analysis.calories) * 100)}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Button onClick={handleSaveMeal} disabled={saveMealMutation.isPending}>
                  {saveMealMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="w-4 h-4 mr-2"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      Save to Journal
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onReset}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="w-4 h-4 mr-2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                  Upload New Image
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
