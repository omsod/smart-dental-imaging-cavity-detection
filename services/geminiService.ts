
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { CavityDetection, CavitySeverity } from "../types";

/**
 * Service to interact with Gemini API for dental cavity detection.
 */
export const detectCavities = async (base64Image: string): Promise<CavityDetection[]> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please configure it in the settings.");
  }

  // Initialize GoogleGenAI inside the function right before the API call to ensure the latest API key is used.
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-3.5-flash";

  const maxRetries = 2;
  let retryCount = 0;

  const executeRequest = async (): Promise<CavityDetection[]> => {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              text: `Act as a professional dental radiologist. Analyze this dental X-ray for cavities (dental caries). 
              Identify all visible cavities and return a JSON array of objects.
              
              Classification Rules for 'extent' (clinical percentage of decay):
              - 'Low': 1-40% extent.
              - 'Moderate': 41-80% extent.
              - 'High': 81-100% extent.
              
              Few-Shot Examples (Dataset Knowledge):
              - Example 1: Small dark spot on enamel surface -> Low severity, 15% extent, 0.4 mm depth.
              - Example 2: Shadow reaching the dentin-enamel junction -> Moderate severity, 55% extent, 1.8 mm depth.
              - Example 3: Large cavitation reaching the pulp chamber -> High severity, 90% extent, 3.5 mm depth.
              
              Each object must include:
              1. 'box': [ymin, xmin, ymax, xmax] coordinates normalized to 0-1000.
              2. 'severity': One of: 'Low', 'Moderate', 'High'.
              3. 'extent': The estimated clinical percentage within the range of the assigned severity (e.g., if Moderate, pick a number between 41 and 80).
              4. 'confidence': A number between 0 and 1 representing AI detection confidence.
              5. 'depth': The estimated physical depth of decay/caries in millimeters (e.g., '0.5 mm', '1.8 mm', '3.2 mm') matching the severity.
              
              If no cavities are found, return an empty array [].`
            },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1]
              }
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                box: {
                  type: Type.ARRAY,
                  items: { type: Type.NUMBER },
                  description: "Bounding box [ymin, xmin, ymax, xmax] normalized 0-1000"
                },
                severity: {
                  type: Type.STRING,
                  enum: [CavitySeverity.LOW, CavitySeverity.MODERATE, CavitySeverity.HIGH]
                },
                extent: {
                  type: Type.INTEGER,
                  description: "Clinical percentage of decay (1-100)"
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "AI confidence (0.0 - 1.0)"
                },
                depth: {
                  type: Type.STRING,
                  description: "Estimated depth penetration of the cavity in mm (e.g., '0.5 mm', '1.8 mm')"
                }
              },
              required: ["box", "severity", "extent", "confidence", "depth"]
            }
          }
        }
      });

      // Correctly accessing the .text property of GenerateContentResponse.
      const jsonStr = response.text || "[]";
      const data = JSON.parse(jsonStr);
      return data.map((d: any, index: number) => ({
        ...d,
        id: `cavity-${index}-${Date.now()}`
      }));
    } catch (error: any) {
      console.error(`Gemini API Error (Attempt ${retryCount + 1}):`, error);
      
      // Handle Quota Exceeded (429) specifically
      if (error.status === "RESOURCE_EXHAUSTED" || error.message?.includes("429") || error.message?.includes("quota")) {
        throw new Error("AI Quota Exceeded: You've reached the limit for free AI requests. Please wait a minute and try again.");
      }

      // Handle Service Unavailable (503) or Overloaded specifically
      if (error.status === "UNAVAILABLE" || error.message?.includes("503") || error.message?.includes("overloaded") || error.message?.includes("high demand")) {
        if (retryCount < maxRetries) {
          retryCount++;
          // Wait 2 seconds before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          return executeRequest();
        }
        throw new Error("AI Service Busy: The AI model is currently experiencing high demand. Please wait a few seconds and try again.");
      }
      
      throw error;
    }
  };

  return executeRequest();
};
