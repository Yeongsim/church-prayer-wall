import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this context, we assume the key is present.
  console.warn("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateSamplePrayer = async (topic: string, languageName: string): Promise<string> => {
  if (!API_KEY) {
    return "API Key not configured. Please contact the administrator.";
  }
  try {
    const promptModifier = 'detailed, heartfelt, and encouraging';
    const lengthConstraint = 'Keep the prayer between 3 and 5 sentences long.';

    const prompt = `Generate a ${promptModifier} prayer in ${languageName} for the following request: "${topic}". The prayer must be in the style of the Local Church / Lord's Recovery movement. It must start with a salutation like "Dear Lord," "Lord Jesus," or "Oh Lord Jesus" in ${languageName}. It must end with "Amen." in ${languageName}. ${lengthConstraint}`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Error generating sample prayer:", error);
    return `Could not generate a sample prayer in ${languageName} at this time. Please try again later.`;
  }
};

export const translateText = async (text: string, languageName: string): Promise<string> => {
    if (!API_KEY) {
        return text; // Return original text if no API key
    }
    try {
        const prompt = `Translate the following text to ${languageName}. Do not add any extra formatting or quotes around it:\n\n"${text}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error(`Error translating text to ${languageName}:`, error);
        return text; // Return original text on error
    }
};