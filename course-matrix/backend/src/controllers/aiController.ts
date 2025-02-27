import asyncHandler from "../middleware/asyncHandler";
import { Request, Response } from "express";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const openai = createOpenAI({
  baseURL: process.env.OPENAI_BASE_URL,
  // apiKey: process.env.OPENAI_API_KEY
});

console.log("Connected to OpenAI API");

export const chat = asyncHandler(async (req: Request, res: Response) => {
  const { messages } = req.body;
  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      `You are an AI chatbot assistant named Morpheus for an application called Course Matrix. ` +
      `Course Matrix is a AI-powered platform designed to streamline the course selection` +
      `and timetable creation process for undergraduate students at University of Toronto Scarborough (UTSC).` +
      `Its key features are: ` +
      `1. Ability to automatically generate timetables for users in 1 click based on their` +
      `preselected courses and personal preferences like times and dates.` +
      `2. Integration with AI to let users create timetables and ask questions about` +
      `courses/offerings using natural language.` +
      `Your Job: respond to the user's questions about course/offering information, which has been provided to you.` +
      `Do not respond to unrelated questions. If the user asks an unrelated question on X, say that you dont have info on X and redirect them.`,
    messages,
  });

  result.pipeDataStreamToResponse(res);
});
