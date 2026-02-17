import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router";
import axiosClient from "../utils/axiosClient";
import toast from 'react-hot-toast';

function VideoSection({problemId, title, secureUrl, thumbnailUrl, duration}){
    const videoRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const { user } = useSelector(state => state.auth);
    const [loading, setLoading] = useState(false);
    const [hasVideo, setHasVideo] = useState(false);

    const togglePlayPause = () => {
        if(videoRef.current){
            if(isPlaying)
                videoRef.current.pause();
            else 
                videoRef.current.play();

            setIsPlaying(!isPlaying);
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds/60);
        const secs = Math.floor(seconds%60);
        return `${mins}:${secs<10 ? '0' : ''}${secs}`;
    }

    const handleDelete = async ()=>{
        if(!window.confirm("Are you sure you want to delete the video solution?")) return;
        try{
            setLoading(true);
            const deleteResult = await axiosClient.delete(`/video/delete/${problemId}`);
            toast.success(deleteResult.data.message);
            setHasVideo(false);
            setLoading(false);
        }
        catch(err){
            setLoading(false);
            toast.error(err.response?.data?.error || "Failed to delete the Video");
        }
    }

    // Handle time update
    useEffect(()=>{
        // Check if a video actually exists
        setHasVideo(Boolean(secureUrl && secureUrl.trim() !== ''));
        
        const video = videoRef.current;
        if(!video) return;

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
        }

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [])

    // Fetch actual duration
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLoadedMetadata = () => {
            setVideoDuration(video.duration);
        };

        video.addEventListener("loadedmetadata", handleLoadedMetadata);

        return () => {
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, []);


    if(loading){
        return(
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        )
    }

    return(
         <div className="space-y-6">
            {/* Header with title and admin actions */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Watch a step-by-step explanation of the optimal approach.
                    </p>
                </div>
                {user.role === 'admin' && (
                    <button
                        className="btn btn-sm bg-red-500/20 hover:bg-red-600/30 text-red-400 border-none"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Video player or placeholder */}
            {hasVideo ? (
                <div className="bg-[#2A2A2A] rounded-xl p-6 shadow-xl">
                    {/* Video container - smaller size */}
                    <div
                        className="relative max-w-md mx-auto rounded-lg overflow-hidden shadow-lg"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                    >
                        <video
                            ref={videoRef}
                            src={secureUrl}
                            poster={thumbnailUrl}
                            onClick={togglePlayPause}
                            className="w-full aspect-video bg-black"
                        />
                        {/* Controls overlay */}
                        <div
                            className={`absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 transition-opacity ${isHovering || !isPlaying ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            <button
                                className="btn btn-circle bg-orange-500 hover:bg-orange-600 text-white border-none mr-3"
                                aria-label={isPlaying ? "Pause" : "Play"}
                                onClick={togglePlayPause}
                            >
                                {isPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="#ffffff">
                                        <path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="#ffffff">
                                        <path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z" />
                                    </svg>
                                )}
                            </button>
                            <div className="flex items-center w-full mt-2">
                                <span className="text-white text-sm mr-2">{formatTime(currentTime)}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={duration}
                                    value={currentTime}
                                    onChange={(e) => {
                                        const time = Number(e.target.value);
                                        if (videoRef.current)
                                            videoRef.current.currentTime = time;
                                        setCurrentTime(time);
                                    }}
                                    className="range text-orange-500 range-xs flex-1"
                                />
                                <span className="text-white text-sm ml-2">{formatTime(duration)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Static description below video */}
                    <div className="mt-6 text-gray-300 text-sm max-w-lg">
                        <p className="leading-relaxed">
                            This video walks you through the thought process and code implementation for solving this problem.
                            You'll learn the key insights, edge cases, and optimal approach.
                        </p>
                        <div className="flex items-center gap-4 mt-4 text-orange-400">
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(duration)} min
                            </span>
                            <span className="flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Beginner friendly
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                // Placeholder when no video
                <div className="bg-[#2A2A2A] mt-6 rounded-xl p-12 text-center shadow-xl max-w-md mx-auto">
                    <div className="text-6xl mb-4">🎥</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No video yet</h3>
                    <p className="text-gray-400">
                        The video solution hasn't been uploaded for this problem. Check back later.
                    </p>
                    {user.role === 'admin' && (
                        <NavLink
                            to={`/admin/upload/${problemId}`}
                            className="btn bg-orange-500 hover:bg-orange-600 text-white border-none mt-6"
                        >
                            Upload Video
                        </NavLink>
                    )}
                </div>
            )}
        </div>
    )
}

export default VideoSection;