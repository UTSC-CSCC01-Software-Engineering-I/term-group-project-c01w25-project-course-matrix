import express from "express";
import { chat } from "../controllers/aiController";

export const aiRouter = express.Router();

aiRouter.post("/chat", chat);
