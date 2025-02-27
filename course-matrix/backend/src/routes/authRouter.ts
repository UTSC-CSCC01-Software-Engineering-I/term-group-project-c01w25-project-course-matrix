import express from "express";

import { handleAuthCode } from "../controllers/authentication";
import {
  login,
  logout,
  session,
  signUp,
  requestPasswordReset,
  resetPassword,
  accountDelete,
} from "../controllers/userController";

export const authRouter = express.Router();

/**
 * Route to handle user signup.
 * @route POST /signup
 */
authRouter.post("/signup", signUp);

/**
 * Route to handle user login.
 * @route POST /login
 */
authRouter.post("/login", login);

/**
 * Route to handle user logout.
 * @route POST /logout
 */
authRouter.post("/logout", logout);

/**
 * Route to handle email confirmation.
 * @route GET /confirm
 */
authRouter.get("/confirm", handleAuthCode);

/**
 * Route to get the current session.
 * @route GET /session
 */
authRouter.get("/session", session);

/**
 * Route to request a password reset.
 * @route POST /request-password-reset
 */
authRouter.post("/request-password-reset", requestPasswordReset);

/**
 * Route to reset the password.
 * @route POST /reset-password
 */
authRouter.post("/reset-password", resetPassword);

/*
 * Route to request that an account is deleted.
 * @route POST /delete-account
 */
authRouter.delete('/accountDelete', accountDelete)