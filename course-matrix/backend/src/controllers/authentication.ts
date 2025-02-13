import {Request, Response} from 'express';

import {supabase} from '../db/setupDb';
import asyncHandler from '../middleware/asyncHandler';

export const handleAuthCode =
    asyncHandler(async (req: Request, res: Response) => {
      const token_hash = req.query.token_hash as string;
      const type = req.query.type as string;
      const next = (req.query.next as string) ?? '/';

      if (token_hash && type) {
        const {error} = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash,
        });

        if (!error) {
          console.log(next);
          console.log('auth success');
          res.redirect(303, `/${next.slice(1)}`);
          return;
        }
      }
      // Redirect to an error page if verification fails or parameters are
      // missing
      res.redirect(303, '/auth/auth-code-error');
    });