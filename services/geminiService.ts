
import { GoogleGenAI, Type } from "@google/genai";
import { ProfilePipelineResult, RiskLevel } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async processHealthForm(
    input: string | { data: string; mimeType: string }
  ): Promise<ProfilePipelineResult> {
    const isImage = typeof input !== 'string';
    
    const prompt = `
      Analyze the provided health lifestyle survey (it might be an image of a form or raw text).
      Perform the following 4 steps in a single response:
      
      Step 1: OCR/Text Parsing
      Extract fields: age, smoker (boolean), exercise, diet. 
      Identify missing fields. Calculate confidence (0.0 to 1.0).
      If more than 50% of key fields (age, smoker, exercise, diet) are missing, set status to "incomplete_profile" and provide a reason.
      
      Step 2: Factor Extraction
      Convert the parsed answers into specific health risk factors (e.g., "smoking", "poor diet", "sedentary lifestyle").
      
      Step 3: Risk Classification
      Compute a risk level (low, medium, high) and a numerical score (0-100) based on non-diagnostic heuristic scoring.
      Provide a rationale list.
      
      Step 4: Recommendations
      Generate 3-5 actionable, non-diagnostic wellness recommendations for the user.
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: isImage 
        ? { parts: [{ inlineData: input }, { text: prompt }] }
        : { parts: [{ text: `Input Text:\n${input}\n\n${prompt}` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parsing: {
              type: Type.OBJECT,
              properties: {
                answers: { 
                  type: Type.OBJECT,
                  properties: {
                    age: { type: Type.NUMBER },
                    smoker: { type: Type.BOOLEAN },
                    exercise: { type: Type.STRING },
                    diet: { type: Type.STRING }
                  }
                },
                missing_fields: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: { type: Type.NUMBER },
                status: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["answers", "missing_fields", "confidence", "status"]
            },
            factors: {
              type: Type.OBJECT,
              properties: {
                factors: { type: Type.ARRAY, items: { type: Type.STRING } },
                confidence: { type: Type.NUMBER }
              },
              required: ["factors", "confidence"]
            },
            classification: {
              type: Type.OBJECT,
              properties: {
                risk_level: { type: Type.STRING },
                score: { type: Type.NUMBER },
                rationale: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["risk_level", "score", "rationale"]
            },
            final: {
              type: Type.OBJECT,
              properties: {
                risk_level: { type: Type.STRING },
                factors: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
                status: { type: Type.STRING }
              },
              required: ["risk_level", "factors", "recommendations", "status"]
            }
          },
          required: ["parsing"]
        }
      }
    });

    try {
      return JSON.parse(response.text.trim()) as ProfilePipelineResult;
    } catch (e) {
      throw new Error("Failed to parse AI response into the required schema.");
    }
  }
}
