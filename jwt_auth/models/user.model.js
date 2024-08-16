import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		lowercase: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
});

// For hashing the password
userSchema.pre('save', async function (next) {
	try {
		const salt = await bcrypt.genSalt(10);
		const hashedPass = await bcrypt.hash(this.password, salt);
		this.password = hashedPass;
		next();
	} catch (error) {
		next(error);
	}
});

// Comparing password while logging.
userSchema.methods.isValidPassword = async function (password) {
	try {
		const isValid = await bcrypt.compare(password, this.password);
		return isValid;
	} catch (error) {
		console.log(error);
		throw error;
	}
};

export const User = mongoose.model('user', userSchema);
