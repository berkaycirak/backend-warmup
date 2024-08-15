import express from 'express';

/*
The routes will be like that;

    1- auth/register
    2- auth/login
    3- auth/logout
    4- auth/refresh-token

*/

export const router = express.Router();

router.post('/register', async (req, res, next) => {
	res.send('Register Route');
});
router.post('/login', async (req, res, next) => {
	res.send('Login Route');
});
router.post('/refresh-token', async (req, res, next) => {
	res.send('Refresh Toke Route');
});
router.delete('/logout', async (req, res, next) => {
	res.send('Logout Route');
});
