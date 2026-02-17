const express = require('express');
const problemRouter = express.Router();

const {createProblem, getProblemAdmin, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedProblemsByUser, submittedProblems} = require('../controllers/problemEndPoints');

const adminMiddleware = require('../middleware/adminMiddleware');
const userMiddleware = require('../middleware/userMiddleware');

// These three route will require admin authentication
// Create problem
problemRouter.post('/create', adminMiddleware, createProblem);

// Update a problem
problemRouter.patch('/update/:id', adminMiddleware, updateProblem);

// Delete a problem
problemRouter.delete('/delete/:id', adminMiddleware, deleteProblem);

// fetch all the problem details for admin
problemRouter.get('/admin/:id', adminMiddleware, getProblemAdmin);

// Any authenticated user/admin can call these routes
// Fetch a particular problem
problemRouter.get('/get/:id', userMiddleware, getProblemById);

// Fetch all problems
problemRouter.get('/list', userMiddleware, getAllProblems);

// Problem solved by a user
problemRouter.get('/solved-by-user', userMiddleware, solvedProblemsByUser);
// Problem solved by a user
problemRouter.get('/submitted-problems/:pid', userMiddleware, submittedProblems);


module.exports = problemRouter;
