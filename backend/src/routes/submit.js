const express = require('express');
const submitRouter = express.Router();

const userMiddleware = require('../middleware/userMiddleware');
const {submitCode, runCode} = require('../controllers/userSubmission');
const rateLimiter = require('../middleware/rateLimiter');

submitRouter.post('/submit/:id', userMiddleware, rateLimiter, submitCode);
submitRouter.post('/run/:id', userMiddleware, rateLimiter, runCode);

module.exports = submitRouter;