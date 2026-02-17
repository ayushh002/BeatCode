const Problem = require('../Models/problem');
const Submission = require('../Models/submission');
const User = require('../Models/user');
const {getlanguageById, submitBatch, submitTokens} = require('../utils/problemUtility');

const submitCode = async (req, res)=>{
    try{
        // Extract user ID from user authentication middleware (attached to req.payload)
        const userId = req.payload._id;
        // Get problem ID from URL parameters
        const problemId = req.params.id;
        // Extract code and language from request body
        const {code, language} = req.body;

        // Validate required fields
        if(!userId || !problemId || !code || !language)
            return res.status(400).send("Some fields are missing.");

        // Fetch problem details including hidden test cases
        const problem = await Problem.findById(problemId);
        if(!problem)
            return res.status(400).send("Problem Not Found");

        // Create initial submission record with pending status
        const submitProblem = await Submission.create({
            userId, 
            problemId, 
            code, 
            language,
            testCasesTotal:problem.hiddenTestCases.length // Set total test cases count
        });

        // Prepare code execution on Judge0
        const languageId = getlanguageById(language);

        // Create batch submissions for all hidden test cases
        const submissions = problem.hiddenTestCases.map(testCase => ({
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output
        }));

        // Submit all test cases to Judge0
        const submitResponse = await submitBatch(submissions);

        // Extract tokens for result retrieval
        const tokens = submitResponse.map(value=>value.token);

        // Fetch detailed results for each submission
        const testResult = await submitTokens(tokens);

        // Process Judge0 results to calculate metrics
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = 'Accepted'; // Default to accepted unless errors found
        let errorMessage = null;
        for(const result of testResult){
            if(result.status_id==3){ // Test case passed
                testCasesPassed++;
                runtime += parseFloat(result.time || 0);
                memory = Math.max(memory, result.memory || 0);
            }
            else if (result.status_id === 4) {  // Wrong Answer
                status = 'Wrong Answer';
                errorMessage = result.expected_output ? `Expected Output: ${result.expected_output}, Your Output: ${result.stdout}` : "Wrong Answer";
                break; // Stop if wrong answer is received
            }
            else if(result.status_id>=7){
                status = 'Runtime Error';
                errorMessage = result.stderr;
                break; // stop after first failure/error
            }
            else{ // Other errors (compilation errors, time limits, etc.)
                status = result.status.description;
                errorMessage = result.stderr;
                break; // stop after first failure/error
            }
        }

        // Update submission with final results
        submitProblem.testCasesPassed = testCasesPassed;
        submitProblem.runtime = runtime;
        submitProblem.memory =  memory;
        submitProblem.status = status;
        submitProblem.errorMessage = errorMessage;

        await submitProblem.save();
        
        // Update user's solved problems array only if submission is accepted &
        // this is the first successful submission for this problem by the user

        const user = await User.findById(userId);

        if(status == 'Accepted' && !user.problemSolved.includes(problemId)){
            user.problemSolved.push(problemId);
            await user.save();
        }
        
        const accepted = (status=='Accepted')
        return res.status(201).json({
            accepted,
            totalTestCases: submitProblem.testCasesTotal,
            passedTestCases: testCasesPassed,
            runtime,
            memory
        });

    }
    catch(err){
        res.status(500).send("Internal Server Error: "+err.message);
    }
}
const runCode = async (req, res)=>{
    try{
        // Extract code and language from request body
        const {language, code} = req.body;

        // Validate required fields
        if(!language || !code)
            return res.status(400).send("Some fields are missing.");

        // Fetch problem details including hidden test cases
        const problem = await Problem.findById(req.params.id);
        if(!problem)
            return res.status(400).send("Problem Not Found");

        // Prepare code execution on Judge0
        const languageId = getlanguageById(language);

        // Create batch submissions for visible test cases
        const submissions = problem.visibleTestCases.map(testCase => ({
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output
        }));

        // Submit all test cases to Judge0
        const submitResponse = await submitBatch(submissions);

        // Extract tokens for result retrieval
        const tokens = submitResponse.map(value=>value.token);

        // Fetch detailed results for each submission
        const testResult = await submitTokens(tokens);

        // Calculate success, runtime, and memory
        let success = true;
        let runtime = 0;
        let memory = 0;

        for(const result of testResult){
            if(result.status_id === 3){ // Test case passed
                runtime += parseFloat(result.time || 0);
                memory = Math.max(memory, result.memory || 0);
            }
            else{ // Any failure
                success = false;
            }
        }

        return res.status(200).json({
            success,
            runtime,
            memory,
            testCases:testResult
        });

    }
    catch(err){
        res.status(500).send("Internal Server Error: "+err.message);
    }
}

module.exports = {submitCode, runCode};