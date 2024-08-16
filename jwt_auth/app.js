import express from 'express';
import createHttpError from 'http-errors';
import 'dotenv/config';
import { router as authRouter } from './routes/auth.route.js';
import morgan from 'morgan';
import connectDB from './lib/db.js';

const app = express();

const PORT = process.env.PORT || 3000; // Where our server will live

app.get('/', async (req, res, next) => {
	res.send('Welcome to my server');
});
// 1st middleware
app.use(morgan('dev'));
app.use(express.json());

// 2nd middleware
app.use('/auth', authRouter);

// 3rd middleware
// If the route will be different than '/', than below middleware function will be used.
app.use(async (req, res, next) => {
	// const error = new Error('Not Found');
	// error.status = 404;
	// next(error);

	next(
		createHttpError.NotFound(
			"Wassapp Dude, There is an error :'( since there is no route like that"
		)
	); // You can use that one instead of above lines. By using next, other middleware function will be triggered and it will access that error argument.
});

// 4th middleware
app.use((err, req, res, next) => {
	res.status(err.status || 500);
	res.send({
		error: {
			status: err.status || 500,
			message: err.message,
		},
	});
});

app.listen(PORT, async () => {
	await connectDB(); // Connect to database
	console.log(`Server running on port ${PORT}`);
});
