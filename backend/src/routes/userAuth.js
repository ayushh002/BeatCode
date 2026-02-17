const express = require('express');
const authRouter = express.Router();

const {register, login, logout, adminRegister, deleteAccount, check} = require('../controllers/userAuthenticate');

const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// user register
authRouter.post('/register', register);

// login
authRouter.post('/login', login);

// logout
authRouter.post('/logout',userMiddleware, logout);

// admin register
authRouter.post('/admin/register', adminMiddleware, adminRegister);

// delete user account
authRouter.delete('/delete-account', userMiddleware, deleteAccount);

authRouter.get('/check', check)
// getProfile
// authRouter.post('/getProfile', getProfile);

module.exports = authRouter;