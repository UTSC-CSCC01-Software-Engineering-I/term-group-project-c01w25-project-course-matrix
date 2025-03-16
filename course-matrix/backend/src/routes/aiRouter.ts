import express from "express";
import { chat, testSimilaritySearch } from "../controllers/aiController";
import { authHandler } from "../middleware/authHandler";

export const aiRouter = express.Router();

/**
 * @route POST /api/ai/chat
 * @description Handles user queries and generates responses using GPT-4o, with optional knowledge retrieval.
 */
aiRouter.post("/chat", authHandler, chat);
/**
 * @route POST /api/ai/test-similarity-search
 * @description Test vector database similarity search feature
 */
aiRouter.post("/test-similarity-search", testSimilaritySearch);
