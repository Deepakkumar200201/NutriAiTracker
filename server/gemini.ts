import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API client
const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Prepare the model for image analysis
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings,
});

// This prompt template instructs the model to analyze food images
const PROMPT_TEMPLATE = 
`Analyze this food image and provide detailed nutritional information in JSON format. 
Focus on identifying the type of meal, its primary ingredients, and estimating the following nutritional values:
- A detailed description of the meal
- Total calories
- Protein (grams)
- Carbohydrates (grams)
- Fat (grams)

Return ONLY a valid JSON object with these fields:
{
  "description": "Detailed description of the food",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}`;

/**
 * Analyzes a food image using the Gemini API and returns nutritional information
 * @param imageBuffer The image buffer to analyze
 * @returns A promise that resolves to the nutritional analysis
 */
export async function analyzeImage(imageBuffer: Buffer) {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.");
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the parts for the model
    const parts = [
      { text: PROMPT_TEMPLATE },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ];

    // Generate content from the model
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });

    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response text
    let jsonString = text;
    
    // If the response contains markdown code blocks, extract the JSON
    if (text.includes("```json")) {
      jsonString = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      jsonString = text.split("```")[1].split("```")[0].trim();
    }
    
    // Parse the JSON response
    const nutritionalInfo = JSON.parse(jsonString);

    // Validate the JSON structure
    if (!nutritionalInfo.description || 
        typeof nutritionalInfo.calories !== 'number' || 
        typeof nutritionalInfo.protein !== 'number' || 
        typeof nutritionalInfo.carbs !== 'number' || 
        typeof nutritionalInfo.fat !== 'number') {
      throw new Error("Invalid response format from Gemini API");
    }

    return nutritionalInfo;
  } catch (error) {
    console.error("Error analyzing image:", error);
    
    // If there's a JSON parsing error or API failure, return placeholder data
    // with an error message as the description
    if (error instanceof Error) {
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
    
    throw new Error("An unknown error occurred while analyzing the image");
  }
}
