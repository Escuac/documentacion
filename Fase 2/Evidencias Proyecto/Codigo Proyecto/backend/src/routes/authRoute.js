import express from 'express';
import { login, logout, check } from '../controllers/authController.js';
import { authJWT } from '../middlewares/authJWT.js';

export const authRouter = express.Router();

authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/check', authJWT, check);