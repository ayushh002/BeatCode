import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import axios from 'axios';
import toast from "react-hot-toast";

function UploadVideo() {
    const { problemId } = useParams();
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
        reset,
    } = useForm();

    const selectedFile = watch('videoFile')?.[0];

    // Upload video on Cloudinary
    const onSubmit = async (data) => {
        const file = data.videoFile[0];

        setUploading(true);
        setUploadProgress(0);

        try {
            // 1. Get upload signature from backend
            const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
            const { signature, timestamp, public_id, api_key, upload_url } = signatureResponse.data;

            // 2. Create FormData for Cloudinary Upload 
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('public_id', public_id);
            formData.append('api_key', api_key);

            // 3. Upload to Cloudinary
            const uploadResponse = await axios.post(upload_url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => { // It keeps getting triggered
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            const cloudinaryResult = uploadResponse.data;

            // 4. Save the metadata to database
            const metadataResponse = await axiosClient.post(`/video/save`, {
                problemId: problemId,
                cloudinaryPublicId: cloudinaryResult.public_id,
                secureUrl: cloudinaryResult.secure_url,
                duration: cloudinaryResult.duration
            })

            reset(); // Reset form after successful upload
            toast.success("Video Successfully Uploaded.");
        }
        catch (err) {
            console.log("Upload Error: ", err);
            toast.error(err.response?.data?.message || "Upload failed. Please try again.");
        }
        finally {
            setUploading(false);
            setUploadProgress(0);
            navigate(`/problem/${problemId}`);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return "0 Bytes";
        const sizes = ["Bytes", "KB", "MB", "GB"];
        let i = 0;
        while (bytes >= 1024 && i < sizes.length - 1) {
            bytes /= 1024;
            i++;
        }
        return bytes.toFixed(2) + " " + sizes[i];
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-[#1a1a1a] to-[#202020]">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold bg-linear-to-r text-white bg-clip-text mb-2">
                        Upload Video Solution
                    </h1>
                    <p className="text-gray-400">
                        Share your explanation with a video walkthrough
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Main Upload Card */}
                    <div className="card bg-[#222222] border border-[#2A2A2A] shadow-2xl">
                        <div className="card-body p-8">
                            {/* Section Header */}
                            <div className="flex items-center mb-6">
                                <div className="h-10 w-1 bg-orange-500 rounded-full mr-3"></div>
                                <h2 className="text-2xl font-bold text-white">Video Upload</h2>
                            </div>

                            <div className="space-y-6">
                                {/* File Input */}
                                <div className="form-control w-full">
                                    <label className="label">
                                        <span className="label-text text-lg font-semibold text-gray-300">
                                            Choose video file
                                        </span>
                                    </label>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        {...register('videoFile', {
                                            required: 'Please select a video file',
                                            validate: {
                                                isVideo: (files) => {
                                                    if (!files || !files[0]) return 'Please select a video file';
                                                    const file = files[0];
                                                    return file.type.startsWith('video/') || 'Please select a valid video file';
                                                },
                                                fileSize: (files) => {
                                                    if (!files || !files[0]) return true;
                                                    const file = files[0];
                                                    const maxSize = 100 * 1024 * 1024; // 100MB
                                                    return file.size <= maxSize || 'File size must be less than 100MB';
                                                }
                                            }
                                        })}
                                        className={`file:border file:border-white file:px-1.5 hover:file:cursor-pointer file:py-0.5 file:rounded-md  file-input-bordered bg-[#2A2A2A] border-[#333] focus:border-orange-500 focus:ring-1 focus:ring-orange-500 w-full py-3 px-4 rounded-lg text-gray-300 ${errors.videoFile ? 'border-red-500' : ''
                                            }`}
                                        disabled={uploading}
                                    />
                                    {errors.videoFile && (
                                        <span className="text-red-400 text-sm mt-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            {errors.videoFile.message}
                                        </span>
                                    )}
                                </div>

                                {/* Selected File Info */}
                                {selectedFile && (
                                    <div className="bg-[#2A2A2A] border border-[#333] rounded-xl p-5">
                                        <div className="flex items-start">
                                            <div className="h-10 w-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3 shrink-0">
                                                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-300">Selected File</h3>
                                                <p className="text-sm text-gray-400">{selectedFile.name}</p>
                                                <p className="text-sm text-gray-400">Size: {formatFileSize(selectedFile.size)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="bg-[#2A2A2A] border border-[#333] rounded-xl p-5">
                                        <div className="flex justify-between text-sm text-gray-300 mb-2">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <progress
                                            className="progress progress-warning w-full h-3"
                                            value={uploadProgress}
                                            max="100"
                                        ></progress>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className={`btn w-full bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-none text-white font-bold text-lg py-4 rounded-xl shadow-lg`}
                                    >
                                        {uploading ? 'Uploading...' : 'Upload Video'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
export default UploadVideo;