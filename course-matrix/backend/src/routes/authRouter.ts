import express from 'express';

import {handleAuthCode} from '../controllers/authentication'
import {login, logout, session, signUp, requestPasswordReset, resetPassword} from '../controllers/userController'

export const authRouter = express.Router();

authRouter.post('/signup', signUp);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/confirm', handleAuthCode);
authRouter.get('/session', session);
authRouter.post('/request-password-reset', requestPasswordReset);
authRouter.post('/reset-password', resetPassword);