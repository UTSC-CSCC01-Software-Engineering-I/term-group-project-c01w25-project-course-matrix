import express from "express";

import { handleAuthCode } from "../controllers/authentication";
import { login, logout, session, signUp } from "../controllers/userController";

export const authRouter = express.Router();

authRouter.post("/signup", signUp);
authRouter.post("/login", login);
authRouter.post("/logout", logout);
authRouter.get("/confirm", handleAuthCode);
authRouter.get("/session", session);
