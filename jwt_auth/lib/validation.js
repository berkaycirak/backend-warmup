import joi from 'joi';

const userValidationSchema = joi.object({
	email: joi.string().email().lowercase().required(),
	password: joi.string().min(8).required(),
});

export { userValidationSchema };
