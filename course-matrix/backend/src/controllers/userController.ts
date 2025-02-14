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
