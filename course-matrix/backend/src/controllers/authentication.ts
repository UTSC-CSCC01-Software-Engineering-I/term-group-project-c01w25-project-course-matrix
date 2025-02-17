import { Request, Response } from "express";

import { supabase } from "../db/setupDb";
import asyncHandler from "../middleware/asyncHandler";

export const handleAuthCode = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const token_hash = req.query.token_hash as string;
      const type = req.query.type as string;
      const next = (req.query.next as string) ?? "/";

      if (!token_hash || !type) {
        return res.status(400).json({ error: "Missing token or type" });
      }

      if (token_hash && type) {
        const { data, error } = await supabase.auth.verifyOtp({
          type: "email",
          token_hash,
        });

        if (!error) {
          console.log("Authentication successful");

          return res.redirect(303, decodeURIComponent(next));
        }
      }
      // Redirect to an error page if verification fails or parameters are
      // missing
      return res.redirect(303, "/auth/auth-code-error");
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
);
