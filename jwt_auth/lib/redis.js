import { createClient } from 'redis';

export const redisClient = createClient({
	password: 'Ol9k0SXh0HfABdkwuLeC2F2hPp4yZP4Y',
	socket: {
		host: 'redis-10672.c270.us-east-1-3.ec2.redns.redis-cloud.com',
		port: 10672,
	},
});

redisClient.on('connect', () =>
	console.log('Redis Client connected')
);
redisClient.on('ready', () => console.log('Redis Client is ready'));
redisClient.on('end', () => console.log('Redis Client disconnected'));
redisClient.on('error', (err) => console.log(err.message));

// When we press ctrl+c on the terminal, we want to disconnected
process.on('SIGINT', () => {
	redisClient.quit();
});

await redisClient.connect();
