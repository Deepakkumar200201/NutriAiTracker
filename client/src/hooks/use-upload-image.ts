import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useUploadImage() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const uploadAndAnalyze = async (file: File) => {
    setIsUploading(true);
    
    try {
      // Create form data to send the image
      const formData = new FormData();
      formData.append("image", file);

      // Send image for analysis
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      const result = await response.json();
      
      return result;
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadAndAnalyze,
    isUploading
  };
}
