import createHttpError from 'http-errors';
import { User } from '../models/user.model.js';
import { userValidationSchema } from '../lib/validation.js';
import {
	signAccessToken,
	signRefreshToken,
	verifyRefreshToken,
} from '../lib/jwt.js';

export const register = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const result = await userValidationSchema.validateAsync(req.body); // validate the body

		if (!email || !password) throw createHttpError.BadRequest();

		// Check from the db whether there is an email registered or not. If not, create a new user
		const user = await User.findOne({ email: result.email });
		if (user) {
			throw createHttpError.Conflict(
				`${result.email} is already registered!`
			);
		} else {
			const newUser = await new User(result).save();
			const accessToken = signAccessToken(newUser.id);
			const refreshToken = signRefreshToken(newUser.id);

			res.send({ accessToken, refreshToken });
		}
	} catch (error) {
		if (error.isJoi === true) error.status = 422;
		next(error);
	}
};

export const login = async (req, res, next) => {
	try {
		const result = await userValidationSchema.validateAsync(req.body);

		// Check whether credentials are correct or not
		const user = await User.findOne({ email: result.email });

		if (!user)
			throw createHttpError.NotFound('User is not registered!');
		const isValidPass = await user.isValidPassword(result.password);
		if (!isValidPass)
			throw createHttpError.Unauthorized(
				'Username/Password are wrong!'
			); //Instead of writing password only, add username here also for more secure.

		const accessToken = signAccessToken(user.id);

		const refreshToken = await signRefreshToken(user.id);

		res.send({ accessToken, refreshToken });
	} catch (error) {
		if (error.isJoe === true)
			return next(
				createHttpError.BadRequest('Invalid username and password')
			);
		next(error);
	}
};

export const refreshToken = async (req, res, next) => {
	try {
		const { refreshToken } = req.body;
		if (!refreshToken) throw createHttpError.BadRequest();
		const userId = await verifyRefreshToken(refreshToken);
		const newAccessToken = signAccessToken(userId);
		const newRefreshToken = await signRefreshToken(userId);

		res.send({
			refreshToken: newRefreshToken,
			accessToken: newAccessToken,
		});
	} catch (error) {
		console.log(error);
		next(error);
	}
};

export const logout = async (req, res, next) => {
	res.send('Logout Route');
};
