const express = require('express');
const aiRouter = express.Router();
const userMiddleware = require('../middleware/userMiddleware')
const aiChat = require('../controllers/aiChat');

aiRouter.post('/chat', userMiddleware, aiChat);

module.exports = aiRouter;