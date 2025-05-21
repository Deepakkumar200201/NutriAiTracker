import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Generate meal plan suggestions based on user's dietary history
 * @param meals Array of meal history data
 * @param days Number of days to generate meal plan for (default: 3)
 * @returns Meal plan suggestions
 */
export async function generateMealPlan(meals: any[], days: number = 3) {
  try {
    // Format meals data for Claude to better understand the dietary history
    const mealsContext = meals.map(meal => {
      return {
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        date: meal.date
      };
    });

    const systemPrompt = `You are a nutritionist AI assistant that creates personalized meal plans based on dietary history.
Analyze the user's previous meals and suggest a ${days}-day meal plan that:
1. Maintains a balanced diet (proteins, carbs, fats)
2. Introduces variety compared to previous meals
3. Stays within similar caloric ranges
4. Includes nutritional information for each meal
5. Focuses on healthy options
6. Provides brief cooking instructions`;

    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is my meal history for the past few days:
${JSON.stringify(mealsContext, null, 2)}

Based on this history, please suggest a personalized meal plan for the next ${days} days. Include breakfast, lunch, dinner, and a snack for each day. 
For each meal, provide:
- Meal name
- Brief description
- Estimated calories, protein, carbs, and fat
- Simple preparation instructions (2-3 steps)

Format the response as structured data that can be easily parsed, with clear sections for each day and meal.`
        }
      ],
    });

    // Parse the response to extract the meal plan
    const responseText = typeof message.content[0] === 'object' && 'text' in message.content[0] 
      ? message.content[0].text 
      : JSON.stringify(message.content);
    
    return {
      success: true,
      mealPlan: responseText
    };
  } catch (error) {
    console.error('Error generating meal plan with Claude:', error);
    return {
      success: false,
      error: 'Failed to generate meal plan. Please try again later.'
    };
  }
}

/**
 * Get personalized nutritional advice based on dietary history
 * @param meals Array of meal history data
 * @returns Nutritional advice and suggestions
 */
export async function getNutritionalAdvice(meals: any[]) {
  try {
    // Format meals data for Claude to better understand the dietary history
    const mealsContext = meals.map(meal => {
      return {
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        date: meal.date
      };
    });

    const systemPrompt = `You are a nutritionist AI assistant that provides personalized dietary advice.
Analyze the user's previous meals and provide helpful nutritional insights:
1. Identify dietary patterns and potential imbalances
2. Suggest improvements for a more balanced diet
3. Recommend nutrient-rich foods they might be missing
4. Provide tips for healthier eating habits`;

    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Here is my meal history for the past few days:
${JSON.stringify(mealsContext, null, 2)}

Based on this history, please provide personalized nutritional advice. I'd like to know:
1. What am I doing well in my diet?
2. What nutrients might I be missing?
3. How could I improve my meal balance?
4. Any specific food suggestions to add to my diet?

Please be specific and actionable with your recommendations.`
        }
      ],
    });

    const responseText = typeof message.content[0] === 'object' && 'text' in message.content[0] 
      ? message.content[0].text 
      : JSON.stringify(message.content);
    
    return {
      success: true,
      advice: responseText
    };
  } catch (error) {
    console.error('Error generating nutritional advice with Claude:', error);
    return {
      success: false,
      error: 'Failed to generate nutritional advice. Please try again later.'
    };
  }
}