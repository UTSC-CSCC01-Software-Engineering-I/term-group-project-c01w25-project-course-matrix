import express from "express";
import { chat, testSimilaritySearch } from "../controllers/aiController";
import { authRouter } from "./authRouter";

export const aiRouter = express.Router();

aiRouter.post("/chat", authRouter, chat);
aiRouter.post("/test-similarity-search", testSimilaritySearch);
