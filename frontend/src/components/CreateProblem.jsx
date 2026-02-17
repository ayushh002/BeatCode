import { useForm, useFieldArray } from "react-hook-form";
import { z } from 'zod';
import axiosClient from "../utils/axiosClient";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from "react";

const problemSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    tags: z.enum(['math', 'array', 'string', 'recursion', 'linkedList']),
    visibleTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required'),
            explanation: z.string().min(1, 'Explanation is required')
        })
    ).min(1, 'At least one visible test case required'),
    hiddenTestCases: z.array(
        z.object({
            input: z.string().min(1, 'Input is required'),
            output: z.string().min(1, 'Output is required')
        })
    ).min(1, 'At least one hidden test case required'),
    startCode: z.array(
        z.object({
            language: z.enum(['c++', 'c', 'js', 'java', 'python']),
            initialCode: z.string().min(1, 'Initial code is required')
        })
    ).length(5, 'All five languages required'),
    referenceSolution: z.array(
        z.object({
            language: z.enum(['c++', 'c', 'js', 'java', 'python']),
            completeCode: z.string().min(1, 'Complete code is required')
        })
    ).length(5, 'All five languages required')
});

function CreateProblem() {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {
        register,
        control,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(problemSchema),
        defaultValues: {
            startCode: [
                { language: 'c++', initialCode: '' },
                { language: 'c', initialCode: '' },
                { language: 'js', initialCode: '' },
                { language: 'java', initialCode: '' },
                { language: 'python', initialCode: '' }
            ],
            referenceSolution: [
                { language: 'c++', completeCode: '' },
                { language: 'c', completeCode: '' },
                { language: 'js', completeCode: '' },
                { language: 'java', completeCode: '' },
                { language: 'python', completeCode: '' }
            ]
        }
    });

    const {
        fields: visibleFields,
        append: appendVisible,
        remove: removeVisible
    } = useFieldArray({
        control,
        name: 'visibleTestCases'
    });

    const {
        fields: hiddenFields,
        append: appendHidden,
        remove: removeHidden
    } = useFieldArray({
        control,
        name: 'hiddenTestCases'
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            await axiosClient.post('/problem/create', data);
            setLoading(false);
            toast.success('Problem Created Successfully');
            navigate('/');
        }
        catch (error) {
            console.error(`Error: ${error.response?.data?.message || error.message}`)
            setLoading(false);
            toast.error("Error Creating Problem.");
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-[#1a1a1a] to-[#202020] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-300 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-[#1a1a1a] to-[#202020]">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-linear-to-r text-white bg-clip-text mb-2">
                        Create New Problem
                    </h1>
                    <p className="text-gray-400">Design coding challenge with comprehensive details</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Information Card */}
                    <div className="card bg-[#222222] border border-[#2A2A2A] shadow-2xl">
                        <div className="card-body p-8">
                            <div className="flex items-center mb-6">
                                <div className="h-10 w-1 bg-orange-500 rounded-full mr-3"></div>
                                <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-semibold text-gray-300">Problem Title</span>
                                    </label>
                                    <input
                                        {...register('title')}
                                        className={`input input-bordered bg-[#2A2A2A] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full py-3 px-4 rounded-lg ${errors.title && 'input-error border-red-500'}`}
                                        placeholder="Enter problem title"
                                    />
                                    {errors.title && (
                                        <span className="text-red-400 text-sm mt-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.title.message}
                                        </span>
                                    )}
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text text-lg font-semibold text-gray-300">Problem Description</span>
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        className={`textarea textarea-bordered bg-[#2A2A2A] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full h-48 p-4 rounded-lg ${errors.description && 'textarea-error border-red-500'}`}
                                        placeholder="Describe the problem statement, constraints, and requirements..."
                                    />
                                    {errors.description && (
                                        <span className="text-red-400 text-sm mt-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.description.message}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-lg font-semibold text-gray-300">Difficulty Level</span>
                                        </label>
                                        <select
                                            {...register('difficulty')}
                                            className={`select select-bordered bg-[#2A2A2A] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full py-3 px-4 rounded-lg ${errors.difficulty && 'select-error border-red-500'}`}
                                        >
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="easy">Easy</option>
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="medium">Medium</option>
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="hard">Hard</option>
                                        </select>
                                    </div>

                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text text-lg font-semibold text-gray-300">Problem Tag</span>
                                        </label>
                                        <select
                                            {...register('tags')}
                                            className={`select select-bordered bg-[#2A2A2A] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full py-3 px-4 rounded-lg ${errors.tags && 'select-error border-red-500'}`}
                                        >
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="array">Array</option>
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="math">Math</option>
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="string">String</option>
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="recursion">Recursion</option>
                                            <option className="text-gray-300 hover:bg-orange-500 hover:text-white py-2" value="linkedList">Linked List</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Cases Card */}
                    <div className="card bg-[#222222] border border-[#2A2A2A] shadow-2xl">
                        <div className="card-body p-8">
                            <div className="flex items-center mb-6">
                                <div className="h-10 w-1 bg-orange-500 rounded-full mr-3"></div>
                                <h2 className="text-2xl font-bold text-white">Test Cases</h2>
                            </div>

                            {/* Visible Test Cases */}
                            <div className="mb-10">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-300 mb-1">Visible Test Cases</h3>
                                        <p className="text-gray-500 text-sm">These test cases will be shown to users</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                                        className="btn bg-orange-500 hover:bg-orange-600 border-none text-white mt-2 sm:mt-0"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Visible Case
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {visibleFields.map((field, index) => (
                                        <div key={field.id} className="bg-[#2A2A2A] border border-[#333] rounded-xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                                                        <span className="text-orange-500 font-bold">{index + 1}</span>
                                                    </div>
                                                    <h4 className="text-lg font-medium text-gray-300">Visible Test Case #{index + 1}</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeVisible(index)}
                                                    className="btn btn-sm bg-red-500/20 hover:bg-red-600/30 text-red-400 border-none"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-gray-400">Input</span>
                                                    </label>
                                                    <input
                                                        {...register(`visibleTestCases.${index}.input`)}
                                                        placeholder="e.g., [1,2,3]"
                                                        className="input input-bordered bg-[#222] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full"
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-gray-400">Expected Output</span>
                                                    </label>
                                                    <input
                                                        {...register(`visibleTestCases.${index}.output`)}
                                                        placeholder="e.g., 6"
                                                        className="input input-bordered bg-[#222] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-gray-400">Explanation</span>
                                                </label>
                                                <textarea
                                                    {...register(`visibleTestCases.${index}.explanation`)}
                                                    placeholder="Explain the test case..."
                                                    className="textarea textarea-bordered bg-[#222] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full h-24"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="divider my-10">
                                <div className="h-px bg-linear-to-r from-transparent via-[#333] to-transparent w-full"></div>
                            </div>

                            {/* Hidden Test Cases */}
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-300 mb-1">Hidden Test Cases</h3>
                                        <p className="text-gray-500 text-sm">These test cases will be used for evaluation only</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => appendHidden({ input: '', output: '' })}
                                        className="btn bg-orange-500 hover:bg-orange-600 border-none text-white mt-2 sm:mt-0"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Add Hidden Case
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {hiddenFields.map((field, index) => (
                                        <div key={field.id} className="bg-[#2A2A2A] border border-[#333] rounded-xl p-5">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center">
                                                    <div className="h-8 w-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                                                        <span className="text-purple-500 font-bold">{index + 1}</span>
                                                    </div>
                                                    <h4 className="text-lg font-medium text-gray-300">Hidden Test Case #{index + 1}</h4>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeHidden(index)}
                                                    className="btn btn-sm bg-red-500/20 hover:bg-red-600/30 text-red-400 border-none"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-gray-400">Input</span>
                                                    </label>
                                                    <input
                                                        {...register(`hiddenTestCases.${index}.input`)}
                                                        placeholder="e.g., [100,200,300]"
                                                        className="input input-bordered bg-[#222] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full"
                                                    />
                                                </div>
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text text-gray-400">Expected Output</span>
                                                    </label>
                                                    <input
                                                        {...register(`hiddenTestCases.${index}.output`)}
                                                        placeholder="e.g., 600"
                                                        className="input input-bordered bg-[#222] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Code Templates Card */}
                    <div className="card bg-[#222222] border border-[#2A2A2A] shadow-2xl">
                        <div className="card-body p-8">
                            <div className="flex items-center mb-6">
                                <div className="h-10 w-1 bg-orange-500 rounded-full mr-3"></div>
                                <h2 className="text-2xl font-bold text-white">Code Templates</h2>
                            </div>

                            <div className="space-y-8">
                                {['c++', 'c', 'js', 'java', 'python'].map((lang, index) => (
                                    <div key={index} className="bg-[#2A2A2A] border border-[#333] rounded-xl p-6">
                                        <div className="flex items-center mb-6">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${lang === 'c++' ? 'bg-blue-500/20' :
                                                    lang === 'c' ? 'bg-gray-500/20' :
                                                        lang === 'js' ? 'bg-yellow-500/20' :
                                                            lang === 'java' ? 'bg-red-500/20' :
                                                                'bg-green-500/20'
                                                }`}>
                                                <span className={`font-bold ${lang === 'c++' ? 'text-blue-400' :
                                                        lang === 'c' ? 'text-gray-400' :
                                                            lang === 'js' ? 'text-yellow-400' :
                                                                lang === 'java' ? 'text-red-400' :
                                                                    'text-green-400'
                                                    }`}>
                                                    {lang.slice(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-300">
                                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-lg font-medium text-gray-300 mb-2">Initial Code Template</span>
                                                </label>
                                                <div className="bg-[#222] border border-[#333] rounded-lg overflow-hidden">
                                                    <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#333]">
                                                        <span className="text-gray-400 text-sm font-mono">Template for {lang}</span>
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        {...register(`startCode.${index}.language`)}
                                                        value={lang}
                                                    />
                                                    <textarea
                                                        {...register(`startCode.${index}.initialCode`)}
                                                        className="w-full bg-[#222] font-mono text-gray-300 p-4 focus:outline-none focus:ring-1 focus:ring-orange-500 min-h-[200px]"
                                                        placeholder={`Enter initial code for ${lang}...`}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text text-lg font-medium text-gray-300 mb-2">Reference Solution</span>
                                                </label>
                                                <div className="bg-[#222] border border-[#333] rounded-lg overflow-hidden">
                                                    <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[#333]">
                                                        <span className="text-gray-400 text-sm font-mono">Solution for {lang}</span>
                                                    </div>
                                                    <input
                                                        type="hidden"
                                                        {...register(`referenceSolution.${index}.language`)}
                                                        value={lang}
                                                    />
                                                    <textarea
                                                        {...register(`referenceSolution.${index}.completeCode`)}
                                                        className="w-full bg-[#222] font-mono text-gray-300 p-4 focus:outline-none focus:ring-1 focus:ring-orange-500 min-h-[200px]"
                                                        placeholder={`Enter complete solution for ${lang}...`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="sticky bottom-0 pt-6 pb-8 bg-linear-to-t from-[#1a1a1a] to-transparent">
                        <button
                            type="submit"
                            className="btn btn-lg w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-none text-white font-bold text-lg py-4 rounded-xl shadow-lg"
                        >
                            Create Problem
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateProblem;