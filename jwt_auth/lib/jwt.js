import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { redisClient } from './redis.js';

export function signAccessToken(userId) {
	const payload = {};
	const secret = process.env.ACCESS_TOKEN_SECRET;
	const options = {
		expiresIn: '15s',
		audience: userId,
	};

	try {
		const access_token = jwt.sign(payload, secret, options);
		return access_token;
	} catch (error) {
		console.log(error);
		throw createHttpError.InternalServerError();
	}
}

// While verifying access token for protected routes in which authenticated user can access

export function verifyAccessToken(req, res, next) {
	if (!req.headers['authorization'])
		return next(createHttpError.Unauthorized());

	const authHeader = req.headers['authorization'];

	const bearerToken = authHeader.split(' ');
	const token = bearerToken[1];
	jwt.verify(
		token,
		process.env.ACCESS_TOKEN_SECRET,
		(err, payload) => {
			if (err) {
				const message =
					err.name === 'JsonWebTokenError'
						? 'Unauthorized'
						: err.message;
				return next(createHttpError.Unauthorized(message));
			}
			console.log(payload);
			req.payload = payload;
			next();
		}
	);
}

export async function signRefreshToken(userId) {
	const payload = {};
	const secret = process.env.REFRESH_TOKEN_SECRET;
	const options = {
		expiresIn: '1y',
		audience: userId,
	};

	try {
		// Directly await the Promise from jwt.sign
		const token = await new Promise((resolve, reject) => {
			jwt.sign(payload, secret, options, (err, token) => {
				if (err) {
					console.log(err.message);
					reject(createHttpError.InternalServerError());
				}
				resolve(token);
			});
		});

		// Directly await Redis client method that returns a Promise
		await redisClient.set(userId, token, { EX: 365 * 24 * 60 * 60 });

		// Return the token
		return token;
	} catch (error) {
		console.log(error.message);
		throw createHttpError.InternalServerError();
	}
}

export async function verifyRefreshToken(refreshToken) {
	const userId = await new Promise((resolve, reject) => {
		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			async (err, decoded) => {
				if (err) {
					console.log(err.message);
					reject(createHttpError.InternalServerError());
				}
				const userId = decoded.aud;
				const token = await redisClient.get(userId);

				if (token === refreshToken) {
					resolve(userId);
				} else {
					reject(createHttpError.Unauthorized());
				}
			}
		);
	});

	return userId;
}
