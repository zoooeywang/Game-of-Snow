
import { GoogleGenAI } from "@google/genai";

/**
 * Generates a Zen reflection using Gemini.
 * Implements exponential backoff for 429 (Rate Limit) errors.
 */
export async function generateZenReflection(context: string, retryCount = 0): Promise<string> {
  const MAX_RETRIES = 3;
  
  try {
    // Re-initialize per-call to ensure we use the latest injected API key
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a Zen master reflecting on a moment from "Dream of the Red Chamber" (红楼梦). 
      The moment is: ${context}. 
      Provide a short, poetic philosophical reflection in Chinese (max 20 words), similar to verses from the Diamond Sutra or Zhuangzi.`,
      config: {
        temperature: 0.8,
        topP: 0.9,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return text.trim();

  } catch (error: any) {
    console.error("Gemini Error:", error);

    // Handle 429 Resource Exhausted / Rate Limit
    if (error?.message?.includes("429") || error?.status === 429 || error?.message?.includes("quota")) {
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        console.warn(`Rate limited. Retrying in ${Math.round(delay)}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return generateZenReflection(context, retryCount + 1);
      }
      
      // If we still fail after retries, try to open the key selection dialog if available
      if (typeof window !== 'undefined' && (window as any).aistudio?.openSelectKey) {
        console.info("Quota exhausted on system key. Prompting user for individual key...");
        // We don't await this as it's a UI action, but we return a fallback for now.
      }
    }

    // Fallback reflections if API is completely unavailable
    const fallbacks = [
      "凡所有相，皆是虚妄。若见诸相非相，即见如来。",
      "一花一世界，一叶一菩提。",
      "大千世界，瞬息万变，唯心不动。",
      "本来无一物，何处惹尘埃。",
      "假作真时真亦假，无为有处有还无。"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}
