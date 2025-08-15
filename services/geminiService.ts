
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real production environment,
  // the API key should be securely managed.
  console.warn("API_KEY environment variable not set. Using a placeholder. The app will not function correctly without a valid key.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || 'YOUR_API_KEY_HERE' });

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { 
      type: Type.NUMBER,
      description: "A single overall score from 0 to 100 for the entire image quality.",
    },
    summary: { 
      type: Type.STRING,
      description: "A concise, 2-3 sentence summary with actionable feedback for the seller."
    },
    report: {
      type: Type.ARRAY,
      description: "An array of analysis criteria.",
      items: {
        type: Type.OBJECT,
        properties: {
          criteria: { 
            type: Type.STRING,
            description: "The name of the quality metric (e.g., 'Lighting', 'Composition', 'Sharpness', 'Background', 'Resolution')."
          },
          score: { 
            type: Type.NUMBER,
            description: "A score from 1 to 10 for this specific criteria."
          },
          explanation: { 
            type: Type.STRING,
            description: "A brief, one-sentence explanation for the score given."
          },
        },
        required: ["criteria", "score", "explanation"],
      },
    },
  },
  required: ["overallScore", "summary", "report"],
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured. Please set the API_KEY environment variable.");
  }
  
  const imagePart = fileToGenerativePart(base64Image, mimeType);
  
  const prompt = "You are an expert in e-commerce product photography. Analyze this image and provide a report card on its quality for a marketplace listing like Amazon or Shopify. Provide a score from 1-10 for each criteria, a brief explanation, and an overall summary with actionable feedback. The response must be a valid JSON object matching the provided schema.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, {text: prompt}] },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.2
      }
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    // Basic validation to ensure the result matches the expected structure.
    if (!result.report || !result.summary || typeof result.overallScore === 'undefined') {
      throw new Error("AI response is missing required fields.");
    }

    return result as AnalysisResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("The configured Gemini API key is invalid. Please check your configuration.");
    }
    throw new Error("Failed to get analysis from AI. The model may have returned an invalid format or an error occurred.");
  }
};
