
import { GoogleGenAI, Type } from "@google/genai";
import { GameWord } from "../types";

export const fetchNewWord = async (): Promise<GameWord> => {
  try {
    // API 키 확인 및 안전한 초기화
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("API_KEY가 설정되지 않았습니다. 기본 단어를 사용합니다.");
      return {
        word: "GEMINI",
        hint: "구글에서 만든 최신 인공지능 모델의 이름입니다.",
      };
    }

    const ai = new GoogleGenAI({ apiKey });
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

    const data = JSON.parse(response.text || '{}');
    return {
      word: (data.word || "HANGMAN").toUpperCase().trim(),
      hint: data.hint || "힌트를 가져오지 못했습니다.",
    };
  } catch (error) {
    console.error("Gemini API 호출 중 오류 발생:", error);
    return {
      word: "ALGORITHM",
      hint: "문제를 해결하기 위한 절차나 방법을 뜻하는 단어입니다.",
    };
  }
};
