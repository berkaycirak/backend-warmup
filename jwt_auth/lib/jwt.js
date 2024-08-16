import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

export function signAccessToken(userId) {
	const payload = {};
	const secret = process.env.ACCESS_TOKEN_KEY;
	const options = {
		expiresIn: '1h',
		audience: userId,
	};

	try {
		const access_token = jwt.sign(payload, secret, options);

		return access_token;
	} catch (error) {
		throw createHttpError.InternalServerError();
	}
}
