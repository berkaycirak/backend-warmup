import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

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

export function signRefreshToken(userId) {
	const payload = {};
	const secret = process.env.REFRESH_TOKEN_SECRET;
	const options = {
		expiresIn: '1y',
		audience: userId,
	};

	try {
		const refresh_token = jwt.sign(payload, secret, options);

		return refresh_token;
	} catch (error) {
		console.log(error);
		throw createHttpError.InternalServerError();
	}
}

export function verifyRefreshToken(refreshToken) {
	return new Promise((resolve, reject) => {
		jwt.verify(
			refreshToken,
			process.env.REFRESH_TOKEN_SECRET,
			(err, decoded) => {
				if (err) reject(createHttpError.Unauthorized());
				const userId = decoded.aud;
				resolve(userId);
			}
		);
	});
}
