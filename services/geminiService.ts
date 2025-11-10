
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini API calls will be mocked.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateDescription = async (itemName: string, category: string, location: string): Promise<string> => {
  if (!API_KEY) {
    return Promise.resolve(`This is a mock description for a ${itemName} in the ${category} category, found at ${location}. It appears to be in good condition.`);
  }

  const prompt = `Generate a concise, professional, and helpful description for a lost and found item.
  
  Item Name: ${itemName}
  Category: ${category}
  Location: ${location}

  The description should be objective and helpful for identification, mentioning key potential features but without making up details. Start directly with the description. For example: "A [color] [item name] was found near [location]..." or "Missing [item name], last seen at [location]...".`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error generating description with Gemini:", error);
    return "Error generating description. Please write one manually.";
  }
};
