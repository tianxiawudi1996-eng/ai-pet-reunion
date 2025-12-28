
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { GenerationResult, GenerationOptions } from "../types";

const generationSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, enum: ["MISSING", "RAINBOW", "TOGETHER", "GROWTH", "ADOPTION"] },
    factSummary: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        subInfo: { type: Type.STRING, description: "Missing Date, Birthday, or Passing Date" },
        location: { type: Type.STRING },
        breedAndFeatures: { type: Type.STRING },
        situation: { type: Type.STRING },
        ownerMessage: { type: Type.STRING },
      },
      required: ["name", "subInfo", "location", "breedAndFeatures", "situation", "ownerMessage"],
    },
    storyType: { type: Type.STRING },
    emotionalIntent: { type: Type.STRING },
    musicDirection: {
      type: Type.OBJECT,
      properties: {
        genre: { type: Type.STRING },
        bpmRange: { type: Type.STRING },
        instruments: { type: Type.STRING },
        vocalStyle: { type: Type.STRING },
      },
      required: ["genre", "bpmRange", "instruments", "vocalStyle"],
    },
    track1: {
      type: Type.OBJECT,
      properties: {
        titleKO: { type: Type.STRING },
        titleEN: { type: Type.STRING },
        stylePrompt: { type: Type.STRING },
        lyrics: { type: Type.STRING },
      },
      required: ["titleKO", "titleEN", "stylePrompt", "lyrics"],
    },
    track2: {
      type: Type.OBJECT,
      properties: {
        titleKO: { type: Type.STRING },
        titleEN: { type: Type.STRING },
        stylePrompt: { type: Type.STRING },
        lyrics: { type: Type.STRING },
      },
      required: ["titleKO", "titleEN", "stylePrompt", "lyrics"],
    },
    youtubePackage: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        descriptionKR: { type: Type.STRING },
        descriptionEN: { type: Type.STRING },
        tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["title", "descriptionKR", "descriptionEN", "tags", "hashtags"],
    },
    imagePrompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          section: { type: Type.STRING },
          imagePromptEN: { type: Type.STRING },
          negativePromptEN: { type: Type.STRING },
          aspectRatio: { type: Type.STRING },
          styleKeywords: { type: Type.STRING },
        },
        required: ["section", "imagePromptEN", "negativePromptEN", "aspectRatio", "styleKeywords"],
      },
    },
  },
  required: [
    "category", "factSummary", "storyType", "emotionalIntent", "musicDirection", "track1", "track2", "youtubePackage", "imagePrompts"
  ],
};

const getApiKey = (providedKey?: string) => {
  const key = providedKey || process.env.API_KEY;
  if (!key) throw new Error("Gemini API Key가 필요합니다. 설정(Settings) 메뉴에서 키를 입력해주세요.");
  return key;
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const ai = new GoogleGenAI({ apiKey });
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "ping",
    });
    return true;
  } catch (e) {
    console.error("API Key Validation Failed:", e);
    throw e;
  }
};

export const analyzeYoutubeContent = async (rawText: string, providedKey?: string): Promise<string> => {
  const apiKey = getApiKey(providedKey);
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `이 텍스트는 반려동물 관련 스토리(실종, 추모, 일상, 성장, 또는 입양 홍보)입니다. 
    이 텍스트에서 반려동물의 이름, 품종, 주요 날짜(생일, 실종일, 별이 된 날 등), 장소, 신체 특징, 그리고 주인의 감정이나 메시지를 추출하여 
    "한 편의 완성된 사연" 형태로 다시 작성해주세요. 
    불필요한 인사는 생략하고 팩트와 감정선 위주로 정리하세요.
    
    데이터:\n${rawText}`,
    config: {
      temperature: 0.7,
      topP: 0.95,
    }
  });

  return response.text || "분석 결과가 없습니다.";
};

export const generateContent = async (options: GenerationOptions): Promise<GenerationResult> => {
  const apiKey = getApiKey(options.apiKey);
  const ai = new GoogleGenAI({ apiKey });

  const musicDirectives = `MUSIC_STUDIO_SETTINGS: [Genre: ${options.musicSettings.genre}, Mood: ${options.musicSettings.mood}, Instruments: ${options.musicSettings.instruments}, Tempo: ${options.musicSettings.tempo}]. MANUAL_OVERRIDE: ${options.manualMusicStyle || 'None'}`;
  
  const visualDirectives = `VISUAL_STUDIO_SETTINGS: [Lighting: ${options.visualSettings.lighting}, Angle: ${options.visualSettings.angle}, Background: ${options.visualSettings.background}, Style: ${options.visualSettings.style}]. MANUAL_OVERRIDE: ${options.manualVisualStyle || 'None'}`;

  let promptContent = `TASK_CATEGORY: ${options.category}\n\n`;
  promptContent += `SOURCE_TEXT (Pet Info):\n${options.sourceText}\n\n`;
  promptContent += `USER_DIRECTIVES:\n${musicDirectives}\n${visualDirectives}\n`;
  
  const textResponse = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: promptContent,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: generationSchema,
      thinkingConfig: { thinkingBudget: 4000 }
    },
  });

  const result = JSON.parse(textResponse.text!) as GenerationResult;

  if (options.autoGenerateImages && result.imagePrompts) {
    // Adjusted visual modifier based on 5 categories
    let categoryModifier = "";
    if (options.category === "RAINBOW") categoryModifier = "Ethereal, soft lighting, memorial, dreamy atmosphere, glowing.";
    else if (options.category === "TOGETHER") categoryModifier = "Bright, sunny, playful, cute, high saturation.";
    else if (options.category === "GROWTH") categoryModifier = "Warm nostalgic, scrapbook style, soft focus, timeline progression.";
    else if (options.category === "ADOPTION") categoryModifier = "Bright studio lighting, eye contact, charming, clean background, hopeful.";
    else categoryModifier = "Realistic, urgent, high contrast, clear details."; // MISSING

    const visualMod = `Visual Directive: ${visualDirectives}. Category Mood: ${categoryModifier}. Negative Prompt: human face, distorted, text, watermark, blurry, deformed paws, extra limbs. Focus on the animal character consistency.`;
    
    const imagePromises = result.imagePrompts.slice(0, 20).map(async (promptData) => {
      try {
        const genAI = new GoogleGenAI({ apiKey });
        const parts: any[] = [];
        if (options.referenceImages && options.referenceImages.length > 0) {
          options.referenceImages.forEach(base64 => {
            parts.push({
              inlineData: { data: base64, mimeType: 'image/png' }
            });
          });
        }
        parts.push({ text: `${promptData.imagePromptEN}. ${visualMod}. Style Keywords: ${promptData.styleKeywords}` });

        const imgResponse = await genAI.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: options.aspectRatio,
              imageSize: "1K"
            }
          }
        });

        for (const part of imgResponse.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) return part.inlineData.data;
        }
      } catch (e) {
        console.error("Image generation failed:", e);
      }
      return undefined;
    });

    const generatedImages = await Promise.all(imagePromises);
    result.imagePrompts = result.imagePrompts.map((p, i) => ({
      ...p,
      generatedImage: generatedImages[i]
    }));
  }

  return result;
};
