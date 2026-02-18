import Editor from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import axiosClient from '../utils/axiosClient';
import VideoSection from '../components/VideoSection';
import SubmissionHistory from '../components/SubmissionHistory';
import ChatAi from '../components/ChatAi';

function ProblemPage(){

    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('c++');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeLeftTab, setActiveLeftTab] = useState('description');
    const [activeRightTab, setActiveRightTab] = useState('code');
    const editorRef = useRef(null);
    const {problemId} = useParams();

    // Fetch Problem data
    useEffect(()=>{
        async function fetchProblem() {
            setLoading(true);
            try{
                const response = await axiosClient.get(`/problem/get/${problemId}`);
                setProblem(response.data.problem);
                setLoading(false);
            }
            catch(err){
                console.error('Error fetching problem:', err);
                setLoading(false);
            }
        }
        fetchProblem();
    }, [problemId])

    // Update code when language changes
    useEffect(()=>{
        if(problem){
           const initialCode = problem.startCode.find(sc=>sc.language===selectedLanguage)?.initialCode || '';
           setCode(initialCode); 
        }
    }, [selectedLanguage, problem])


    const handleRun = async () => {
        setLoading(true);
        setRunResult(null);
        try{
            const response = await axiosClient.post(`/submission/run/${problemId}`, {
                language:selectedLanguage,
                code:code
            })
            setRunResult(response.data);
            setLoading(false);
            setActiveRightTab('testcase');
        }
        catch(err){
            console.error("Error running code: ", err);
            setRunResult({
                success:false,
                error: 'Internal Server Error'
            })
            setLoading(false);
            setActiveRightTab('testcase');
        }
    }


    const handleSubmit = async () => {
        setLoading(true);
        setSubmitResult(null);
        try{
            const response = await axiosClient.post(`/submission/submit/${problemId}`, {
                language:selectedLanguage,
                code:code
            })

            setSubmitResult(response.data);
            setLoading(false);
            setActiveRightTab('result');
        }
        catch(err){
            console.error("Error running code: ", err);
            setSubmitResult({
                accepted:false,
                error: 'Internal Server Error'
            })
            setLoading(false);
            setActiveRightTab('result');
        }
    }

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };

    const getLanguageForMonaco = (lang) => {
        switch(lang) {
            case 'js' : return 'javascript';
            case 'java' : return 'java';
            case 'c++' : return 'cpp';
            case 'c' : return 'c';
            case 'python' : return 'python';
            default: return 'cpp';
        }
    }

    const getDisplayName = (lang) => {
        switch (lang) {
            case 'c++': return 'C++';
            case 'java': return 'Java';
            case 'js': return 'JavaScript';
            case 'c': return 'C';
            case 'python': return 'Python';
            default: return lang;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'text-green-500';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-red-500';
            default: return 'text-gray-500';
        }
    };

    if (loading && !problem) {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#1a1a1a] to-[#202020] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return(
        <div className='min-h-screen sm:h-screen flex flex-col sm:flex-row bg-[#222222]'>  
            {/* Left Panel */}
            <div className="w-full sm:w-1/2 flex-1 sm:flex-none flex flex-col border-r border-base-300">
                {/* Left Tabs */}
                <div className="tabs tabs-bordered bg-[#2A2A2A] px-4">
                    <button 
                        onClick={()=>setActiveLeftTab('description')}
                        className={`tab ${activeLeftTab === 'description' ? 'tab-active': ''}`}
                    >
                        Description
                    </button>
                    <button 
                        onClick={()=>setActiveLeftTab('editorial')}
                        className={`tab ${activeLeftTab === 'editorial' ? 'tab-active': ''}`}
                    >
                        Editorial
                    </button>
                    <button 
                        onClick={()=>setActiveLeftTab('solutions')}
                        className={`tab ${activeLeftTab  === 'solutions' ? 'tab-active': ''}`}
                    >
                        Solutions
                    </button>
                    <button 
                        onClick={()=>setActiveLeftTab('submissions')}
                        className={`tab ${activeLeftTab  === 'submissions' ? 'tab-active': ''}`}
                    >
                        Submissions
                    </button>
                    <button 
                        onClick={()=>setActiveLeftTab('aichat')}
                        className={`tab ${activeLeftTab  === 'aichat' ? 'tab-active': ''}`}
                    >
                        AI Bot
                    </button>
                </div>
                {/* Left Content */}
                <div className='flex-1 overflow-y-auto p-6'>
                    {problem && (
                        <>
                            {activeLeftTab==='description' && (
                                <>
                                    <div className='flex gap-4 items-center mb-6'>
                                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                                        <div className={`badge badge-outline ${getDifficultyColor(problem.difficulty)}`}>
                                            {problem.difficulty.charAt(0).toUpperCase()+problem.difficulty.slice(1)}
                                        </div>
                                        <div className="badge bg-orange-500 border-orange-500">
                                            {problem.tags.charAt(0).toUpperCase()+problem.tags.slice(1)}
                                        </div>
                                    </div>

                                    <div className="prose max-w-none">
                                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                        {problem.description}
                                        </div>
                                    </div>

                                    <div className='mt-8'>
                                        <h3 className="text-lg font-semibold mb-4">Sample Test Cases:</h3>
                                        <div className='space-y-4'>
                                            {problem.visibleTestCases.map((testcase, index)=>(
                                                <div key={index} className='bg-[#2A2A2A] p-4 rounded-lg'>
                                                   <h4 className="font-semibold mb-2">Test Case {index + 1}:</h4>
                                                    <div className="space-y-2 text-sm font-mono overflow-x-auto">
                                                        <p><strong>Input: </strong>{testcase.input}</p>
                                                        <p><strong>Output: </strong>{testcase.output}</p>
                                                        <p><strong>Explanation: </strong>{testcase.explanation}</p>
                                                    </div>
                                                </div>
                                                
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeLeftTab === 'editorial' && (
                                <div>
                                    <VideoSection problemId={problem._id} title={problem.title} secureUrl={problem.secureUrl} thumbnailUrl={problem.thumbnailUrl} duration={problem.duration}/>
                                </div>
                                
                            )}

                            {activeLeftTab === 'solutions' && (
                                <div>
                                    <h2 className="text-xl font-bold mb-4">Solutions</h2>
                                    <div className="space-y-6">
                                        {problem.referenceSolution?.map((solution, index) => (
                                        <div key={index} className=" bg-[#2A2A2A] rounded-lg">
                                            <div className="px-4 py-2 rounded-t-lg">
                                            <h3 className="font-semibold">{problem?.title} - {solution?.language}</h3>
                                            </div>
                                            <div className='bg-gray-500 h-0.5' />
                                            <div className="p-2">
                                            <pre className=" p-4 rounded text-sm overflow-x-auto">
                                                <code>{solution?.completeCode}</code>
                                            </pre>
                                            </div>
                                        </div>
                                        )) || <p className="text-gray-500">Solutions will be available after you solve the problem.</p>}
                                    </div>
                                </div>
                            )}

                            {activeLeftTab === 'submissions' && (
                                <div>
                                <h2 className="text-xl font-bold mb-4">Your Submissions</h2>
                                <SubmissionHistory problemId={problemId}/>
                                </div>
                            )}

                            {activeLeftTab === 'aichat' && (
                                <div className="prose max-w-none">
                                <h2 className="text-xl font-bold mb-4">Your AI Assistant</h2>
                                <ChatAi problem={problem} code={code}/>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full sm:w-1/2 flex-1 sm:flex-none flex flex-col">
                {/* Right Tabs */}
                <div className="tabs tabs-bordered bg-[#2A2A2A] px-4">
                    <button 
                        className={`tab ${activeRightTab === 'code' ? 'tab-active' : ''}`}
                        onClick={() => setActiveRightTab('code')}
                    >
                        Code
                    </button>
                    <button 
                        className={`tab ${activeRightTab === 'testcase' ? 'tab-active' : ''}`}
                        onClick={() => setActiveRightTab('testcase')}
                    >
                        Testcase
                    </button>
                    <button 
                        className={`tab ${activeRightTab === 'result' ? 'tab-active' : ''}`}
                        onClick={() => setActiveRightTab('result')}
                    >
                        Result
                    </button>
                </div>

                {/* Right Content */}
                <div className="flex-1 flex flex-col">
                    {/* Code Editor */}
                    {activeRightTab=='code' && (
                        <div className='flex-1 flex flex-col'>
                            {/* Language Selector */}
                            <div className='flex gap-2 items-center bg-[#1E1E1E]'>
                                {['c++', 'java', 'c', 'python', 'js'].map(lang=>(
                                    <button
                                        key={lang}
                                        className={`rounded-sm px-3 py-1 cursor-pointer text-sm font-medium text-white ${selectedLanguage===lang? 'bg-orange-400' : ''}`}
                                        onClick={()=>setSelectedLanguage(lang)}
                                    >
                                        {getDisplayName(lang)}
                                    </button>
                                ))}
                            </div>

                            {/* Monaco Editor */}
                            <div className="flex-1 min-h-[200px]">
                                <Editor
                                    height="100%"
                                    className="min-h-[200px]"
                                    language={getLanguageForMonaco(selectedLanguage)} 
                                    value={code}
                                    onChange={(value) => setCode(value || '')}
                                    onMount={handleEditorDidMount}
                                    theme="vs-dark"
                                    options={{
                                        fontSize:14,
                                        minimap:{enabled:true},
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 2,
                                        insertSpaces: true,
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        glyphMargin: false,
                                        folding: true,
                                        lineDecorationsWidth: 10,
                                        lineNumbersMinChars: 3,
                                        renderLineHighlight: 'line',
                                        selectOnLineNumbers: true,
                                        roundedSelection: false,
                                        readOnly: false,
                                        cursorStyle: 'line',
                                        mouseWheelZoom: true
                                    }}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className='flex bg-[#2a2a2a] justify-between p-4'>
                                <button 
                                    className="btn hover:bg-[#2A2A2A] btn-ghost btn-sm hover:border-[#2A2A2A]"
                                    onClick={() => setActiveRightTab('testcase')}
                                >
                                    Console
                                </button>
                                <div className='flex gap-2'>
                                    <button 
                                        className={`btn btn-sm btn-outline hover:bg-[#1e1c1c] border-white`}
                                        onClick={handleRun}
                                        disabled={loading}
                                    >
                                        Run
                                    </button>
                                    <button 
                                        className={`btn bg-orange-500 hover:bg-orange-600 border-none btn-sm `}
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Run Result */}
                    {activeRightTab=='testcase' && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Test Results</h3>
                            {runResult ? (
                                <div className={`alert bg-[#2A2A2A] mb-4`}>
                                    {runResult.success ? (
                                        <div>
                                            <h4 className='font-bold text-green-400 mb-4'>✅ All test cases passed!</h4>
                                            <p className="text-sm font-semibold mt-2">Runtime: {runResult.runtime+" sec"}</p>
                                            <p className="text-sm font-semibold">Memory: {runResult.memory+" KB"}</p>
                                            
                                            <div className="mt-4 space-y-2">
                                                {runResult.testCases.map((tc, i) => (
                                                    <div key={i} className="bg-[#242424] p-3 rounded text-xs">
                                                    <div className="font-mono overflow-x-auto">
                                                        <div><strong>Input:</strong> {tc.stdin}</div>
                                                        <div><strong>Expected:</strong> {tc.expected_output}</div>
                                                        <div><strong>Output:</strong> {tc.stdout}</div>
                                                        <div className={'text-green-600'}>
                                                        {'✓ Passed'}
                                                        </div>
                                                    </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (runResult.error ? (
                                            <h4 className="font-bold text-lg pb-4 text-red-500">
                                                {runResult.error || 'Wrong Answer'}
                                            </h4>
                                        ) : (
                                            <div>
                                                <h4 className="font-bold text-xl text-red-500">Error</h4>
                                                <div className="mt-4 space-y-2 ">
                                                    {runResult.testCases.map((tc, i)=>(
                                                        <div key={i} className="bg-[#242424] py-3 pl-3 pr-10 rounded text-xs">
                                                            <div className="font-mono space-y-0.5 overflow-x-auto">
                                                                <div><strong>Input:</strong> {tc.stdin}</div>
                                                                <div><strong>Expected:</strong> {tc.expected_output}</div>
                                                                <div><strong>Output:</strong> {tc.stdout}</div>
                                                                <div className={tc.status_id==3 ? 'text-green-600' : 'text-red-600'}>
                                                                {tc.status_id==3 ? '✓ Passed' : '✗ Failed'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                Click "Run" to test your code with the example test cases.
                                </div>
                            )}
                        </div>
                    )}
                    {/* Submit Result */}
                    {activeRightTab=='result' && (
                        <div className="flex-1 p-4 overflow-y-auto">
                            <h3 className="font-semibold mb-4">Submission Result</h3>
                            {submitResult ? (
                                <div className='alert bg-[#2A2A2A]'>
                                    {submitResult.accepted? (
                                        <div>
                                            <h4 className={`font-bold text-lg text-green-400`}>👏 Accepted</h4>
                                            <div className='space-y-2 mt-4 text-white font-semibold'>
                                                <p>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                <p>Runtime: {submitResult.runtime + "sec"} </p>
                                                <p>Memory: {submitResult.memory + "KB"} </p>
                                            </div>
                                        </div>
                                    ): (
                                        <div className='text-white '>
                                            <h4 className="font-bold text-lg text-red-500">{submitResult.error || 'Wrong Answer'}</h4>
                                            <div className="my-4 pl-1 space-y-2">
                                                {!submitResult.error && (
                                                    <p className='font-semibold'>Test Cases Passed: {submitResult.passedTestCases}/{submitResult.totalTestCases}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ):
                            (
                                <div className="text-gray-500">
                                    Click "Submit" to submit your solution for evaluation.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) 
}

export default ProblemPage;
