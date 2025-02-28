import cookieParser from "cookie-parser";
import { CookieOptions, Request, Response } from "express";
import config from "../config/config";
import { supabase } from "../db/setupDb";
import asyncHandler from "../middleware/asyncHandler";

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true, // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

/**
 * @route POST /auth/signup
 * @description Registers a new user by creating an account with Supabase.
 *
 * This endpoint:
 * - Accepts user details (email and password) from the request body.
 * - Calls Supabase's `signUp()` method to create a new user account.
 * - Sends a confirmation email to the user if registration is successful.
 */
export const signUp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // calling supabase for user registeration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${config.CLIENT_APP_URL}/signup-success`,
        data: {
          username: username,
        },
      },
    });

    if (data.user?.identities?.length === 0) {
      console.error("User already exists", error);
      return res.status(400).json({
        error: {
          message: "User already exists",
          status: 400,
        },
      });
    }

    if (error) {
      return res.status(400).json(error);
    }

    res
      .status(201)
      .json({ message: "User registered successfully!", user: data.user });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route POST /auth/login
 * @description Authenticates a user using Supabase and starts a session.
 *
 * This endpoint:
 * - Accepts user credentials (email and password) from the request body.
 * - Calls Supabase's `signInWithPassword()` method to verify the credentials.
 * - Store the refresh_token as Cookies if authentication is successful.
 * - Responds with an error if authentication fails.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // user sign in via supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json(error);
    }

    res.cookie("refresh_token", data.session?.refresh_token, COOKIE_OPTIONS);

    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

    res.status(200).json({
      message: "Login Success!",
      access_token: data.session?.access_token,
      user: data.user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route POST /auth/logout
 * @description Logs out the authenticated user by signing them out of Supabase.
 *
 * This endpoint:
 * - Calls Supabase's `signOut()` method to end the user's session.
 * - Clears the user's refresh token Cookie
 * - Returns a success message if the logout is successful.
 * - Responds with an error if the logout process fails.
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json(error);
    }

    res.clearCookie("refresh_token", COOKIE_OPTIONS);

    res.status(200).json({ message: "User logged out" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

/**
 * @route GET /auth/session
 * @description Fetches the current user session using the refresh token.
 *
 * This endpoint:
 * - Retrieves the refresh token from cookies.
 * - Calls Supabase's `refreshSession()` method to refresh the session.
 * - Responds with the user data if the session is successfully refreshed.
 * - Responds with an error if the session refresh fails.
 */
export const session = asyncHandler(async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token)
      return res.status(401).json({ error: "Not Authorized" });

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) return res.status(401).json({ error: error.message });

    res
      .status(200)
      .json({ message: "User fetched successfully", user: data.user });
  } catch (error: any) {
    console.error("Session Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /auth/request-password-reset
 * @description Sends a password reset email to the user.
 *
 * This endpoint:
 * - Accepts the user's email from the request body.
 * - Calls Supabase's `resetPasswordForEmail()` method to send a reset email.
 * - Responds with a success message if the email is sent.
 * - Responds with an error if the email sending fails.
 */
export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${config.CLIENT_APP_URL}/reset-password`,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({
        message: "Password reset email sent. Check your inbox.",
      });
    } catch (error: any) {
      console.error("Error requesting reset:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @route POST /auth/reset-password
 * @description Updates the user's password after verifying the token.
 *
 * This endpoint:
 * - Accepts the new password from the request body.
 * - Calls Supabase's `updateUser()` method to update the password.
 * - Responds with a success message if the password is updated.
 * - Responds with an error if the password update fails.
 */
export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (!password) {
        return res.status(400).json({ error: "New password is required" });
      }

      const { data, error } = await supabase.auth.updateUser({ password });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      return res.json({ message: "Password successfully updated." });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      res.status(500).json({ error: error.message });
    }
  },
);

/**
 * @route DELETE /auth/accountDelete
 * @description Deletes a users's account
 *
 * This endpoint:
 * - Takes 1 field, the user's UUID
 * - Calls supabase's deleteUser() method to delete the user
 * - Responds with a success message if the user is deleted successfully
 * - Responds with an error message if the user is not deleted successfully
 */
export const accountDelete = asyncHandler(
  async (req: Request, res: Response) => {
    const { uuid } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: "User ID (uuid) is required" });
    }

    const { error } = await supabase.auth.admin.deleteUser(uuid);

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({
      message: `User ${uuid} deleted successfully`,
    });
  },
);

/**
 * @route UPDATE
 * @description Updates a users's accoount username
 *
 * This endpoint:
 * - Takes 1 field, the user's new username
 * - Calls supabase's updayUserById function
 * - Responds with a success message if the username updates successfully
 * - Responds with an error message if the username updates unsuccessfully
 */
export const updateUsername = asyncHandler(
  async (req: Request, res: Response) => {
    const { username } = req.body;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    if (!user) {
      return res.status(400).json({ error: "Unable to get user" });
    } else {
      const updatedMetadata = { ...user.user_metadata, username: username };

      const { data, error } = await supabase.auth.updateUser({
        data: updatedMetadata,
      });

      if(error){
        return res.status(400).json({error: "unable to update user"});
      } else {
        return res.status(400).json(`Updated metadata: ${updatedMetadata}`);
      }
    }
  } 
)