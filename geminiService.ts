import { GoogleGenAI, Type } from "@google/genai";

/**
 * Vite frontend env vars must start with VITE_
 * Set on Vercel: VITE_GEMINI_API_KEY = <your key>
 */
function getAI() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  // Fail fast so UI won't spin forever
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error(
      "Missing VITE_GEMINI_API_KEY. Add it in Vercel Environment Variables and redeploy."
    );
  }

  return new GoogleGenAI({ apiKey });
}

function stripBase64Prefix(input: string) {
  // supports "data:image/jpeg;base64,...." or raw base64
  return input.includes("base64,") ? input.split("base64,")[1] : input;
}

export const generateBanner = async (
  destination: string
): Promise<string | null> => {
  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `A beautiful, high-quality wide landscape photograph of ${destination}. Aesthetic travel photography style, sunny day, cinematic lighting, no text, no people. 16:9 aspect ratio.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData?.data) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating banner:", error);
    return null;
  }
};

export const fetchCurrentWeather = async (location: string) => {
  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Get the current weather for ${location}. Return a JSON object with: high (number), low (number), condition (string: e.g. Sunny, Cloudy, Rainy, Snowy), and city (string).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            high: { type: Type.NUMBER },
            low: { type: Type.NUMBER },
            condition: { type: Type.STRING },
            city: { type: Type.STRING },
          },
          required: ["high", "low", "condition", "city"],
        },
      },
    });

    // response.text should be JSON string
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};

export const editTravelPhoto = async (
  base64Image: string,
  prompt: string
): Promise<string | null> => {
  try {
    const ai = getAI();

    const base64Data = stripBase64Prefix(base64Image);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          { text: prompt },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if ((part as any).inlineData?.data) {
        return `data:image/png;base64,${(part as any).inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error editing photo:", error);
    return null;
  }
};

export const chatWithGemini = async (
  message: string,
  history: any[],
  modelName: string = "gemini-3-flash-preview",
  imagePart?: { mimeType: string; data: string }
) => {
  try {
    const ai = getAI();

    const chat = ai.chats.create({
      model: modelName,
      history,
      config: {
        systemInstruction: `You are a helpful travel assistant.
FORMATTING: Use clear Markdown. Use bold for key locations. Use ### for headers. Use bullet points.
TONE: Friendly, expert, and encouraging.
CAPABILITY: You can see images if the user uploads them. Analyze food, signs, or landmarks in images.`,
      },
    });

    const parts: any[] = [{ text: message }];
    if (imagePart) {
      parts.push({ inlineData: imagePart });
    }

    // Keep the same call style you used originally
    const result = await chat.sendMessage({ message: parts as any });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, something went wrong! Please try again. ✨";
  }
};

export const translateVision = async (
  base64Image: string,
  from: string,
  to: string
): Promise<string> => {
  try {
    const ai = getAI();

    const base64Data = stripBase64Prefix(base64Image);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `You are a travel assistant. Detect all text in this image written in ${from} and translate it to ${to}. Only return the translated text. If there is no text, return "No text detected". Keep it concise.`,
          },
        ],
      },
    });

    return response.text || "Could not translate.";
  } catch (error) {
    console.error("Translation error:", error);
    return "Error during translation.";
  }
};

export const translateText = async (
  text: string,
  from: string,
  to: string
): Promise<string> => {
  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate this text from ${from} to ${to}: "${text}". Only return the translation.`,
    });

    return response.text || "Could not translate.";
  } catch (error) {
    console.error("Text translation error:", error);
    return "Error during translation.";
  }
};

export const translateAudio = async (
  base64Audio: string,
  from: string,
  to: string
): Promise<string> => {
  try {
    const ai = getAI();

    const base64Data = stripBase64Prefix(base64Audio);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: "audio/webm",
            },
          },
          {
            text: `Transcribe and translate the speech in this audio from ${from} to ${to}. Only return the final translated text.`,
          },
        ],
      },
    });

    return response.text || "Could not understand audio.";
  } catch (error) {
    console.error("Audio translation error:", error);
    return "Error during audio processing.";
  }
};
