import OpenAI from "openai";
// services/GlobalService.ts
import axios from "axios";
import { CoachingExperts, CoachingOptions } from "./options";
export const getToken = async () => {
  const result = await axios.get("/api/getToken");
  return result.data.token; // Only the token string, as expected
};

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_AI_OPENROUTER,
  dangerouslyAllowBrowser: true,
});
export const AiModal = async (
  topic: string | undefined,
  coachingOption: string | undefined,
  msg: string | undefined
) => {
  try {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    if (!option) {
      console.error("Coaching option not found");
      return "";
    }

    const PROMPT = option.prompt.replace(`{user_topic}`, topic || "general discussion");
    
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-exp:free",
      messages: [
        { role: "system", content: PROMPT }, // Use 'system' role for instructions
        { role: "user", content: msg || "" },
      ],
    });

    // Return the actual response text
    return completion.choices[0]?.message?.content || "";
    
  } catch (error) {
    console.error("AI API Error:", error);
    return ""; // Return empty string on error
  }
};