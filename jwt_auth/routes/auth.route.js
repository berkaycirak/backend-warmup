import express from 'express';

import {
	login,
	logout,
	refreshToken,
	register,
} from '../controllers/auth.controller.js';
import createHttpError from 'http-errors';
import { verifyRefreshToken } from '../lib/jwt.js';
import { redisClient } from '../lib/redis.js';

/*
The routes will be like that;

    1- auth/register
    2- auth/login
    3- auth/logout
    4- auth/refresh-token

*/

export const router = express.Router();

router.post('/register', register);

router.post('/login', login);

// When user's access token is expired, user can use that endpoint to obtain new access token by using refresh-token that is provided while registering or logging.
router.post('/refresh-token', refreshToken);
router.delete('/logout', async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) throw createHttpError.BadRequest();
		const userId = await verifyRefreshToken(refreshToken);
		await redisClient.del(userId);
		res.sendStatus(204);
	} catch (error) {
		next(error);
	}
});
