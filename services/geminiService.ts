import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAiInsight = async (prompt: string, contextData: string): Promise<string> => {
  try {
    // Fixed: Updated model to gemini-3-flash-preview for Basic Text Tasks per guidelines
    const model = 'gemini-3-flash-preview';
    const fullPrompt = `
      You are an AI assistant for the Super Admin of CollabCRM, a payroll software.
      
      Context Data (Current Dashboard State):
      ${contextData}

      User Query: ${prompt}

      Provide a concise, professional, and helpful response suitable for a business dashboard. 
      If the user asks for a summary, summarize the data provided.
      If the user asks for a draft email, write a professional email.
      Keep it under 150 words unless specified otherwise.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: fullPrompt,
    });

    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};