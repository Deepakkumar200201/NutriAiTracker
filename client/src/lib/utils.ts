import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function calculateMacroPercentages(calories: number, protein: number, carbs: number, fat: number) {
  // Each gram of protein and carbs = 4 calories
  // Each gram of fat = 9 calories
  const proteinCalories = protein * 4;
  const carbCalories = carbs * 4;
  const fatCalories = fat * 9;
  
  return {
    protein: Math.round((proteinCalories / calories) * 100),
    carbs: Math.round((carbCalories / calories) * 100),
    fat: Math.round((fatCalories / calories) * 100)
  };
}

// Convert base64 to blob for upload
export function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}
