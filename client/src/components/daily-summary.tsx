import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Meal } from "@shared/schema";
import { useState } from "react";
import { toast } from "react-hot-toast";

// Default daily targets
const DEFAULT_TARGETS = {
  calories: 2100,
  protein: 105,
  carbs: 225,
  fat: 70,
};

export default function DailySummary() {
  const { data: meals } = useQuery<Meal[]>({
    queryKey: ["/api/meals/today"],
  });

  // Calculate totals from today's meals
  const totals = meals?.reduce(
    (acc, meal) => {
      return {
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  // Calculate percentages for progress bars
  const percentages = {
    calories: Math.min(100, Math.round((totals.calories / DEFAULT_TARGETS.calories) * 100)),
    protein: Math.min(100, Math.round((totals.protein / DEFAULT_TARGETS.protein) * 100)),
    carbs: Math.min(100, Math.round((totals.carbs / DEFAULT_TARGETS.carbs) * 100)),
    fat: Math.min(100, Math.round((totals.fat / DEFAULT_TARGETS.fat) * 100)),
  };

  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleSaveToJournal = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(totals),
      });
      if (!res.ok) throw new Error("Failed to save to journal");
      toast.success("Saved to journal!");
    } catch (err) {
      toast.error("Error saving to journal");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadJournal = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/journal/download");
      if (!res.ok) throw new Error("Failed to download journal");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Journal downloaded!");
    } catch (err) {
      toast.error("Error downloading journal");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="mb-8">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Today's Nutrition Summary
          </h2>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Total Calories</span>
              <span className="font-semibold">
                {totals.calories} / {DEFAULT_TARGETS.calories}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${percentages.calories}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Protein</span>
                <span className="font-semibold">
                  {totals.protein}g / {DEFAULT_TARGETS.protein}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${percentages.protein}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Carbs</span>
                <span className="font-semibold">
                  {totals.carbs}g / {DEFAULT_TARGETS.carbs}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#F59E0B] h-2.5 rounded-full"
                  style={{ width: `${percentages.carbs}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Fat</span>
                <span className="font-semibold">
                  {totals.fat}g / {DEFAULT_TARGETS.fat}g
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#10B981] h-2.5 rounded-full"
                  style={{ width: `${percentages.fat}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <Button variant="outline" onClick={handleSaveToJournal} disabled={saving}>
              {saving ? "Saving..." : "Save to Journal"}
            </Button>
            <Button variant="outline" onClick={handleDownloadJournal} disabled={downloading}>
              {downloading ? "Downloading..." : "Download Journal"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
