let genAI: any = null;

export const generateAiInsight = async (prompt: string, contextData: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
      console.warn("Gemini API Key is missing or placeholder. Skipping AI insights.");
      return "AI insights are currently unavailable. Please configure VITE_GEMINI_API_KEY.";
    }

    if (!genAI) {
      genAI = new GoogleGenAI({ apiKey });
    }

    // Fixed: Updated model to gemini-3-flash-preview for Basic Text Tasks per guidelines
    const modelName = 'gemini-3-flash-preview';
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

    const model = genAI.models.get(modelName);
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
    });

    return result.response.text() || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
};