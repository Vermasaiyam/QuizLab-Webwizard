import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from 'axios';
import { Loader2 } from "lucide-react";
import TextCarousel from "./TextCrousel";

export default function Home() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [inputType, setInputType] = useState("file"); // State to control the dropdown selection
    const [youTubeUrl, setYouTubeUrl] = useState("");

    const loadingTexts = [
        "Loading file...",
        "Transcribing file...",
        "Summarizing content...",
        "Generating quiz...",
    ];

    const [loadingStep, setLoadingStep] = useState(0);

    useEffect(() => {
        if (loading) {
            let step = 0;
            const interval = setInterval(() => {
                setLoadingStep((prev) => {
                    if (prev + 1 < loadingTexts.length) {
                        return prev + 1;
                    } else {
                        clearInterval(interval); // Stop when last message is reached
                        return prev;
                    }
                });
            }, 5000); // Change text every 5 seconds

            return () => clearInterval(interval);
        } else {
            setLoadingStep(0); // Reset when loading is false
        }
    }, [loading]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (inputType === "youtube" && !youTubeUrl) {
            toast.error("Please provide a YouTube URL.");
            return;
        }

        setLoading(true);

        try {
            if (inputType === "youtube") {
                // Handle YouTube URL processing
                const response = await axios.post("http://localhost:5000/download-audio", {
                    url: youTubeUrl,
                });

                console.log("Response from backend:", response);  // Log the response

                if (response.data.audioFile) {
                    console.log("Audio file path:", response.data.audioFile);
                }

                const audioFile = response.data.audioFile; // Assuming backend returns the audio file path

                // Send audio file to Python backend for transcription
                const transcriptionResponse = await axios.post(
                    "http://127.0.0.1:5000/transcribe",
                    { file: audioFile },
                    { headers: { "Content-Type": "application/json" } }
                );

                const transcription = transcriptionResponse.data.transcription;

                if (!transcription) {
                    toast.error("Failed to get transcription.");
                    setLoading(false);
                    return;
                }

                console.log("Transcription: ", transcription);

                // Request summary from Python backend
                const summaryResponse = await axios.post(
                    "http://127.0.0.1:5000/modify",
                    {
                        modification_input: "give me summary of the transcribed text.",
                        transcription: transcription,
                    },
                    { headers: { "Content-Type": "application/json" } }
                );

                const summaryText = summaryResponse.data.modified_text;

                if (!summaryText) {
                    toast.error("Failed to get summary from Python backend.");
                    setLoading(false);
                    return;
                }

                console.log("Summary: ", summaryText);

                // Save transcription and summary in the database
                const videoData = {
                    videoId: "youtube_video_id", // Replace with actual YouTube video ID or custom ID if needed
                    transcription: transcription,
                    summary: summaryText,
                };

                const saveTranscriptionResponse = await axios.post(
                    "http://localhost:8000/api/video/uploadTranscription",
                    videoData,
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );

                if (saveTranscriptionResponse.data.success) {
                    navigate(`/summary/${videoData.videoId}`);
                } else {
                    toast.error("Failed to save transcription.");
                }

            } else {
                // File upload logic (for audio/video files)
                const formData = new FormData();
                formData.append("file", file);

                // Upload video to Node.js backend
                const uploadResponse = await axios.post(
                    "http://localhost:8000/api/video/uploadVideo",
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                        withCredentials: true,
                    }
                );

                if (!uploadResponse.data.success) {
                    toast.error("Failed to upload video.");
                    setLoading(false);
                    return;
                }

                const video = uploadResponse.data.video;
                const videoUrl = video.videoUrl;

                // Send video file to Python backend for transcription
                const transcriptionFormData = new FormData();
                transcriptionFormData.append("file", file);

                const transcriptionResponse = await axios.post(
                    "http://127.0.0.1:5000/transcribe",
                    transcriptionFormData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );

                const transcription = transcriptionResponse.data.transcription;

                if (!transcription) {
                    toast.error("Failed to get transcription.");
                    setLoading(false);
                    return;
                }

                console.log("Transcription: ", transcription);

                // Request summary from Python backend
                const summaryResponse = await axios.post(
                    "http://127.0.0.1:5000/modify",
                    {
                        modification_input: "give me summary of the transcribed text.",
                        transcription: transcription,
                    },
                    { headers: { "Content-Type": "application/json" } }
                );

                const summaryText = summaryResponse.data.modified_text;

                if (!summaryText) {
                    toast.error("Failed to get summary from Python backend.");
                    setLoading(false);
                    return;
                }

                console.log("Summary: ", summaryText);

                // Save transcription and summary in the database
                const payload = {
                    videoId: video._id,
                    transcription: transcription,
                    summary: summaryText,
                };

                const saveTranscriptionResponse = await axios.post(
                    "http://localhost:8000/api/video/uploadTranscription",
                    payload,
                    {
                        headers: { "Content-Type": "application/json" },
                        withCredentials: true,
                    }
                );

                if (saveTranscriptionResponse.data.success) {
                    navigate(`/summary/${video._id}`);
                } else {
                    toast.error("Failed to save transcription.");
                }
            }

        } catch (error) {
            console.error("Error during upload:", error);
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0B1930] min-h-[90vh] flex flex-col items-center justify-center text-white p-4">

            <div className="flex flex-col items-center justify-center text-white">
                <TextCarousel />
            </div>

            {/* Input Box Section */}
            <div className="bg-white text-gray-900 w-full max-w-xl mt-6 p-6 rounded-2xl shadow-lg">
                <h2 className="text-md font-bold">Turn YouTube videos or audio into quizzes and summaries.</h2>
                <p className="text-gray-500 text-sm">No credit card required.</p>

                <div className="flex items-center mb-4">
                    <label htmlFor="inputType" className="mr-2 text-gray-700">Select Input Type:</label>
                    <select
                        id="inputType"
                        value={inputType}
                        onChange={(e) => setInputType(e.target.value)}
                        className="p-2 rounded-lg"
                    >
                        <option value="file">Upload Audio/Video</option>
                        <option value="youtube">Provide YouTube URL</option>
                    </select>
                </div>

                {/* Conditional input fields */}
                {inputType === "youtube" ? (
                    <div className="py-4 bg-white rounded-lg shadow-md">
                        <label className="block text-lg font-semibold text-gray-800 mb-2">Enter YouTube URL:</label>
                        <input
                            type="text"
                            placeholder="Paste YouTube URL"
                            className="w-full text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:bg-gray-200"
                            onChange={(e) => setYouTubeUrl(e.target.value)} // Add state for URL
                        />
                    </div>
                ) : (
                    <div className="py-4 bg-white rounded-lg shadow-md">
                        <label className="block text-lg font-semibold text-gray-800 mb-2">Upload Audio/Video here:</label>
                        <input
                            type="file"
                            accept="audio/*,video/*"
                            className="w-full text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:bg-gray-200"
                            onChange={handleFileChange}
                        />
                    </div>
                )}

                <div>
                    <button
                        className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 hover:bg-blue-700"
                        onClick={handleUpload}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center w-full cursor-not-allowed">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {loadingTexts[loadingStep]}
                            </div>
                        ) : (
                            <span className="text-white font-bold lg:text-lg text-base px-1">
                                Get your Quiz/Summary for free →
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}