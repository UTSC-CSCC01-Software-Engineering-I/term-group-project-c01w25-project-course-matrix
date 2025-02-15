// Middleware to check if user is authenticated (via access token)
// Use on endpoints that require an authenticated user to access

import { Request, Response, NextFunction } from "express";
import asyncHandler from "./asyncHandler";
import { supabase } from "../db/setupDb";
import { Session, User } from "@supabase/supabase-js";

// Or a simpler approach directly in your middleware file:
interface AuthenticatedRequest extends Request {
  user?: User;
  session?: Session;
}

export const authHandler = asyncHandler( async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Check refresh token in cookies to determine if authorized
  const refreshToken = req.cookies.refresh_token;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token found' });
  }

  try {
    // Verify the session
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      res.clearCookie('refresh_token');
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    // Attach user and session to request for route handlers to access later
    (req as AuthenticatedRequest).user = data?.user ?? undefined;
    (req as AuthenticatedRequest).session = data?.session ?? undefined;

    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
})