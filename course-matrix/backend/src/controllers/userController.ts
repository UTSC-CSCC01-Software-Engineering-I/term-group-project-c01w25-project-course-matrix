import {Request, Response} from 'express';

import {supabase} from '../db/setupDb';
import asyncHandler from '../middleware/asyncHandler';



export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const {email, password} = req.body;

  try {
    // calling supabase for user registeration

    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'http://localhost:8081',
      },
    });

    if (error) {
      return res.status(400).send({error});
    }

    res.status(200).json({message: 'Success'});
    console.log(data);
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
      return res.status(400).send({error});
    }

    res.status(200).json({message: 'Success', user: data.user});
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const {refresh_token} = req.body;

  try {
    const {error} = await supabase.auth.signOut();
    if (error) {
      return res.status(400).send({error});
    }

    res.status(200).json({message: 'Success'});
  } catch (error) {
    res.status(500).json({message: 'Internal Server Error'});
  }
});
