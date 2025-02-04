import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { Loader2 } from "lucide-react";
import TextCarousel from "./TextCrousel";

export default function Home() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
        if (!file) {
            alert("Please select a file.");
            return;
        }

        try {
            // 1. Upload the video to the Node.js backend
            setLoading(true);
            const formData = new FormData();
            formData.append("file", file);

            // Send request to Node.js backend to upload the video
            const uploadResponse = await axios.post(
                "http://localhost:8000/api/video/uploadVideo",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true, // Send cookies with request
                }
            );

            if (uploadResponse.data.success) {
                const video = uploadResponse.data.video; // The uploaded video object from Node.js
                const videoUrl = video.videoUrl;

                // 2. Send the video file to the Python backend for transcription
                const transcriptionFormData = new FormData();
                transcriptionFormData.append("file", file); // Send the actual file here

                const transcriptionResponse = await axios.post(
                    "http://127.0.0.1:5000/transcribe",
                    transcriptionFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data", // This header is important for file upload
                        },
                    }
                );

                const transcription = transcriptionResponse.data.transcription;

                if (transcription) {
                    console.log("Transcription: ", transcription);

                    // 3. Call the Node.js backend to save transcription in the database
                    // console.log("Video ID", video._id);
                    // console.log("Video URL", video.videoUrl);
                    const payload = {
                        videoId: video._id, // Use the video ID from the upload response
                        transcription: transcription, // Transcription text from Python backend
                    };

                    // Change headers to send application/json
                    const saveTranscriptionResponse = await axios.post(
                        "http://localhost:8000/api/video/uploadTranscription",
                        payload, // Send JSON data
                        {
                            headers: {
                                "Content-Type": "application/json", // Use JSON content type
                            },
                            withCredentials: true,
                        }
                    );

                    if (saveTranscriptionResponse.data.success) {
                        // alert("Transcription saved successfully.");
                        navigate(`/summary/${video._id}`);
                    } else {
                        alert("Failed to save transcription.");
                    }
                } else {
                    alert("Failed to get transcription from Python backend.");
                }

                setLoading(false);
            } else {
                alert("Failed to upload video.");
            }
        } catch (error) {
            console.error("Error during file upload and processing:", error);
            alert(error);
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

                {/* Input Box */}
                <div className="py-4 bg-white rounded-lg shadow-md">
                    <label className="block text-lg font-semibold text-gray-800 mb-2">Upload Audio/Video here:</label>
                    <input
                        type="file"
                        accept="audio/*,video/*"
                        className="w-full text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 hover:bg-gray-200"
                        onChange={handleFileChange}
                    />
                </div>

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
