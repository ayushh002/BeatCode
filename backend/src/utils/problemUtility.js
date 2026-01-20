const axios = require('axios');

const getlanguageById = (lang)=>{
    const language = {
        "c": 110,          // C (Clang 19.1.7)
        "c++": 105,        // C++ (GCC 14.1.0)
        "c#": 51,          // C# (Mono 6.6.0.161)
        "java": 91,        // Java (JDK 17.0.6)
        "js": 102, // JavaScript (Node.js 22.08.0)
        "python": 109,     // Python (3.13.2)
        "go": 107,         // Go (1.23.5)
        "kotlin": 111,     // Kotlin (2.1.10)
        "php": 98,         // PHP (8.3.11)
        "rust": 108,       // Rust (1.85.0)
        "scala": 112,      // Scala (3.4.2)
        "typescript": 101  // TypeScript (5.6.2)
    };
    return language[lang.toLowerCase()];

}

const submitBatch = async (submittion)=>{
    try {
        const options = {
            method: 'POST',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
                base64_encoded: 'false'
            },
            headers: {
                'x-rapidapi-key': process.env.JUDGE0_API,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
                'Content-Type': 'application/json'
            },
            data: {
                submissions: submittion
            }
        };

        // Send the code to Judge0 for execution
        const response = await axios.request(options);
        return response.data;
    } 
    catch (err) {
        console.log("Error: "+err.message);
    }

}

async function waiting(timer) {
    setTimeout(()=>{
        return 1;
    }, timer);
}

const submitTokens = async (tokens)=>{
    try {
        const options = {
            method: 'GET',
            url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
            params: {
                tokens: tokens.join(","),
                base64_encoded: 'false',
                fields: '*'
            },
            headers: {
                'x-rapidapi-key': process.env.JUDGE0_API,
                'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
            }
        };

        async function fetchData() {
            // Send the tokens to Judge0 for getting the result
            const response = await axios.request(options);
            return response.data;
        }
        
        // keep fetching the result until status_id < 3
        while(true){
            // fetch the submittion result
            const res = await fetchData();

            // Check that all the code are executed successfully or with an error
            const isResultObtained = res.submissions.every(sub=>sub.status_id>=3);

            if(isResultObtained)
                return res.submissions;

            // wait for 1 sec before fetching the data again - ensures enough time 
            // is provided to Judge0 for successful execution of the code
            await waiting(1000);
            
        }
    } 
    catch (err) {
        console.log("Error: "+err.message);
    }
   
}

const checkSolution = async (req)=>{

    const { visibleTestCases, referenceSolution } = req.body;

        // Iterate over each reference solution to validate correctness (1 submission per language)
        for(const {language, completeCode} of referenceSolution){
            
            // get the language id
            const languageId = getlanguageById(language);

            // Build a batch submission array for Judge0
            const submissions = visibleTestCases.map(testCase => ({
                source_code: completeCode,
                language_id: languageId,
                stdin: testCase.input,
                expected_output: testCase.output
            }));

            // Get response from Judge0
            const submitResponse = await submitBatch(submissions);

            // Extract each token and make it an array
            const tokens = submitResponse.map(value=>value.token);

            // Validate output from tokens
            const testResult = await submitTokens(tokens);

            // check the correctness of solution
            const isValid = testResult.every(sub => sub.status_id == 3);

            if(!isValid){
                const err = new Error("Reference solution failed against visible test cases");
                err.name = "TestCaseError";
                throw err;
            }
        }
}

module.exports = {getlanguageById, submitBatch, submitTokens, checkSolution};