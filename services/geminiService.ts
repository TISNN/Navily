import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API_KEY found in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeUrlWithGemini = async (url: string, userHint?: string): Promise<AIAnalysisResult> => {
  const ai = getClient();
  
  // Fallback if no API key is present
  if (!ai) {
    return {
      title: "New Bookmark",
      description: "No API key configured. Please add description manually.",
      category: "Uncategorized",
      tags: ["new"],
      icon: "🔖"
    };
  }

  const prompt = `
    Analyze the following URL (and optional hint) to create a concise bookmark entry.
    URL: ${url}
    ${userHint ? `User Hint: ${userHint}` : ''}
    
    Return a JSON object with:
    - title: A short, clean title (max 40 chars).
    - description: A brief summary of what this site is for (max 100 chars).
    - category: A single general category word (e.g., Work, Study, Life, Tools, Design, Dev, News).
    - tags: An array of 3-5 short lowercase keywords (hashtags).
    - icon: A single emoji that best represents the content.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            icon: { type: Type.STRING },
          },
          required: ["title", "description", "category", "tags", "icon"],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Return a graceful fallback based on the URL string itself
    const domain = url.split('/')[2] || url;
    return {
      title: domain,
      description: "Could not auto-analyze. Please edit details.",
      category: "Other",
      tags: ["link"],
      icon: "🔗"
    };
  }
};