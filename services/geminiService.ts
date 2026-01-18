
import { GoogleGenAI, Type } from "@google/genai";
import { GameWord } from "../types";

// Fix: Use process.env.API_KEY directly in the initialization object as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchNewWord = async (): Promise<GameWord> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a random English word for a hangman game. The word should be common enough to know but challenging. Provide a short dictionary definition or current events context in Korean as a hint.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word: {
              type: Type.STRING,
              description: "A single English word in uppercase.",
            },
            hint: {
              type: Type.STRING,
              description: "A dictionary definition or current events explanation in Korean.",
            },
          },
          required: ["word", "hint"],
        },
      },
    });

    // Fix: Using the .text property to extract response content.
    const data = JSON.parse(response.text || '{}');
    return {
      word: data.word.toUpperCase().trim(),
      hint: data.hint,
    };
  } catch (error) {
    console.error("Error fetching word from Gemini:", error);
    // Fallback word in case of API error
    return {
      word: "ALGORITHM",
      hint: "어떠한 문제를 해결하기 위해 정해진 일련의 절차나 방법.",
    };
  }
};
