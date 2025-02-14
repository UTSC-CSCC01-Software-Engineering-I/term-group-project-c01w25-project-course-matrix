import express from 'express';

import {handleAuthCode} from '../controllers/authentication'
import {login, logout, session, signUp} from '../controllers/userController'

export const usersRouter = express.Router();

usersRouter.post('/signup', signUp);
usersRouter.post('/login', login);
usersRouter.post('/logout', logout);
usersRouter.get('/confirm', handleAuthCode);
usersRouter.get('/session', session);