const Problem = require('../Models/problem');
const User = require('../Models/user');
const Submission = require('../Models/submission');
const SolutionVideo = require('../Models/solutionVideo');
const {checkSolution} = require('../utils/problemUtility');


const createProblem = async(req, res) =>{
    try{
        // Check the reference solution are correct against the visible test cases
        await checkSolution(req);

        // Add the problem to the database as everything is fine
        const problem = await Problem.create({
            ...req.body,
            problemCreator: req.admin._id // attach admin id added from admin middleware
        });

        return res.status(201).send("Problem Added Successfully");
    }
    catch(err){
        if (err.name === "ValidationError") 
            return res.status(400).send("Validation Error: " + err.message);
        else if(err.name === "TestCaseError")
            return res.status(400).send("Error: "+err.message);
        res.status(500).send("Server Error: " + err.message);
    }

}


const updateProblem = async(req, res) =>{
    try{
        const {id} = req.params;

        if(!id) 
            return res.status(404).send("Problem Id not found");

        // Check the reference solution are correct against the visible test cases
        await checkSolution(req);
        
        const updatedProblem = await Problem.findByIdAndUpdate(
            id, 
            {...req.body},
            {new: true, runValidators: true }
        );

        if (!updatedProblem) {
            return res.status(404).send("Problem not found");
        }

        return res.status(200).json({
            message: "Problem Updated Successfully",
            problem: updatedProblem
        });
    }
    catch(err){
        if (err.name === "ValidationError") 
            return res.status(400).send("Validation Error: " + err.message);
        else if(err.name === "TestCaseError")
            return res.status(400).send("Error: "+err.message);
        res.status(500).send("Server Error: " + err.message);
    }
}


const deleteProblem = async(req, res) =>{
    try{
        const {id} = req.params;

        if(!id) 
            return res.status(404).send("Problem Id not found");

        const deletedProblem = await Problem.findByIdAndDelete(id);

        if (!deletedProblem) {
            return res.status(404).send("Problem not found");
        }

        // Delete all the submittions for this problem
        await Submission.deleteMany({problemId:id});

        // Remove this problem from all users' solvedProblems
        await User.updateMany(
            { problemSolved: id },
            { $pull: { problemSolved: id } }
        );

        return res.status(200).send( "Problem Deleted Successfully");
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}


const getProblemById = async(req, res) =>{
    try{
        const {id} = req.params;

        if(!id) 
            return res.status(404).send("Problem Id not found");

        const getProblem = await Problem.findById(id).select('_id title description difficulty tags visibleTestCases startCode referenceSolution');

        if (!getProblem) {
            return res.status(404).send("Problem not found");
        }

        // Fetch metadata of the video and attach it with the problem
        const videoMetadata = await SolutionVideo.findOne({problemId: id});
        if(videoMetadata){
            const response = {
                ...getProblem.toObject(),
                secureUrl: videoMetadata.secureUrl,
                thumbnailUrl: videoMetadata.thumbnailUrl,
                duration: videoMetadata.duration
            };
            return res.status(200).json({
                message: "Problem Fetched Successfully",
                problem: response
            });
        }
                
        res.status(200).json({
            message: "Problem Fetched Successfully",
            problem: getProblem
        });
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const getProblemAdmin = async(req, res) =>{
    try{
        const {id} = req.params;

        if(!id) 
            return res.status(404).send("Problem Id not found");

        const getProblem = await Problem.findById(id);

        if (!getProblem) {
            return res.status(404).send("Problem not found");
        }

        return res.status(200).json(getProblem);
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}


const getAllProblems = async(req, res) =>{
    try{
        // Fetch All Problems
        const getProblems = await Problem.find({}).select('_id title difficulty tags');

        if (!getProblems.length) {
            return res.status(404).send("Problem not found");
        }

        return res.status(200).json({
            message: "All Problems Fetched Successfully",
            totalProblems:getProblems.length,
            problems: getProblems
        });
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}


const solvedProblemsByUser = async(req, res) =>{
    try{
        const user = await User.findById(req.payload._id).populate(
            {
                path:"problemSolved",
                select:"_id title difficulty tags"
            }
        );
        
        if(!user)
            return res.status(404).send("User not found");

        return res.status(200).json({
            totalProblemsSolved: user.problemSolved.length,
            problems:user.problemSolved
        });
    }
    catch(err){
        res.status(500).send("Error: "+err.message);
    }
}

const submittedProblems = async (req, res) => {
    try{
        const userId = req.payload._id;
        const problemId = req.params.pid;

        const totalSubmissions = await Submission.find({userId, problemId});

        res.status(200).json(totalSubmissions);
    }
    catch(err) {
        res.status(500).send("Error: "+err.message);
    }
}


module.exports = {createProblem, getProblemAdmin, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedProblemsByUser, submittedProblems};
