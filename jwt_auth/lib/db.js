import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_DB_URL);

		console.log(`MongoDB Connected: ${conn.connection.host}`);

		// Event listeners
		mongoose.connection.on('disconnected', () => {
			console.log('MongoDB disconnected');
		});

		mongoose.connection.on('error', (err) => {
			console.error(`MongoDB connection error: ${err}`);
		});

		// Graceful shutdown
		process.on('SIGINT', async () => {
			await mongoose.connection.close();
			console.log(
				'MongoDB connection closed through app termination'
			);
			process.exit(0);
		});
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB;
