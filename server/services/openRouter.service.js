import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const askAi = async (messages) => {
  try {
    // Validate input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("Messages array is empty.");
    }

    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: messages,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",

          // Optional but recommended
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "InterviewIQ AI",
        },
      }
    );

    // Return only the AI response
    const content=response?.data?.choices?.[0]?.message?.content;
    if(!content || !content.trim()){
        throw new Error("Received empty response from OpenRouter.");
    }
    return content;
  } catch (error) {
    console.error("OpenRouter Error:");

    if (error.response) {
      console.error(error.response.data);
      throw new Error(
        error.response.data?.error?.message ||
          "Failed to fetch response from OpenRouter."
      );
    }

    throw error;
  }
};