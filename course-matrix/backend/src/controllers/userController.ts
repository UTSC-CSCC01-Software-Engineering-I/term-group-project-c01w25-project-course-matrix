import cookieParser from 'cookie-parser';
import {CookieOptions, Request, Response} from 'express';

import config from '../config/config';
import {supabase} from '../db/setupDb';
import asyncHandler from '../middleware/asyncHandler';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,  // Prevents JavaScript access (XSS protection)
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
    const {email, password} = req.body;

    // calling supabase for user registeration
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {emailRedirectTo: `${config.CLIENT_APP_URL}/signup-success`},
    });

    if (data.user?.identities?.length === 0) {
      console.error('User already exists', error);
      return res.status(400).json({
        error: {
          message: 'User already exists',
          status: 400
        }
      });
    }

    if (error) {
      return res.status(400).json(error);
    }

    res.status(201).json(
        {message: 'User registered successfully!', user: data.user});

  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
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
  const {email, password} = req.body;

  try {
    // user sign in via supabase
    const {data, error} =
        await supabase.auth.signInWithPassword({email, password});

    if (error) {
      return res.status(401).json(error);
    }

    res.cookie('refresh_token', data.session?.refresh_token, COOKIE_OPTIONS);

    res.status(200).json({
      message: 'Login Success!',
      access_token: data.session?.access_token,
      user: data.user
    });
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
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
    const {error} = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json(error);
    }

    res.clearCookie('refresh_token', COOKIE_OPTIONS);

    res.status(200).json({message: 'User logged out'});
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

/**
 * @route GET /auth/session
 * @description Retrieves the current user's authentication session.
 * 
 * This endpoint:
 * - Calls Supabase's `refreshSession()` method to refresh the user's session. 
 * - Returns the user info if the user is logged in.
 * - Responds with an error if no session is found or if an issue occurs.
 */
export const session = asyncHandler(async (req: Request, res: Response) => {
  try {
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token) return res.status(401).json({error: 'Not Authorized'});

    const {data, error} = await supabase.auth.refreshSession({refresh_token});

    if (error) return res.status(401).json({error: error.message});

    res.status(200).json(
        {message: 'User fetched successfully', user: data.user});
  } catch (error: any) {
    console.error('Session Error:', error);
    res.status(500).json({error: error.message});
  }
});

/**
 * @route POST /auth/request-password-reset
 * @desc Sends a password reset email to the user.
 */
export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {email} = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${config.CLIENT_APP_URL}/reset-password`
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password reset email sent. Check your inbox.' });

  } catch (error: any) {
    console.error('Error requesting reset:', error);
    res.status(500).json({error: error.message});
  }
});


/**
 * @route POST /auth/reset-password
 * @desc Updates the user's password after verifying the token.
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  try {
    const {password} = req.body;

    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const {data ,error } = await supabase.auth.updateUser({password});

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Password successfully updated.' });

  } catch (error: any) {
    console.error('Error resetting password:', error);
    res.status(500).json({error: error.message});
  }
});