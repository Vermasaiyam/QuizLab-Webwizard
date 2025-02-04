import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const SummaryPage = () => {
    const { id } = useParams(); // Get the video ID from the URL parameter
    const [videoDetails, setVideoDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch video details from the backend
        const fetchVideoDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/video/summary/${id}`, {
                    withCredentials: true, // Send cookies with request
                });
                if (response.data.success) {
                    setVideoDetails(response.data.video);
                } else {
                    alert("Failed to fetch video details.");
                }
            } catch (error) {
                console.error("Error fetching video details:", error);
                alert("An error occurred while fetching video details.");
            } finally {
                setLoading(false);
            }
        };

        fetchVideoDetails();
    }, [id]);

    const handleGenerateQuiz = async () => {
        try {
            setLoading(true);

            const transcription = videoDetails.transcription;

            const response = await axios.post(
                'http://127.0.0.1:5000/modify',
                {
                    modification_input: 'give me the 5 quiz questions from the text in JSON format, in the format of question as string, options as array of strings, correctAns as string.',
                    transcription: transcription,
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            console.log('Response from Python backend:', response.data);

            let modifiedText = response.data.modified_text;

            console.log("modifiedText", modifiedText);

            // Clean the response by extracting the JSON part
            const jsonStartIndex = modifiedText.indexOf('[');
            const jsonEndIndex = modifiedText.lastIndexOf(']') + 1;
            const jsonString = modifiedText.slice(jsonStartIndex, jsonEndIndex);

            console.log('Extracted JSON string:', jsonString);

            const quizQuestions = JSON.parse(jsonString);

            console.log('Parsed quiz questions:', quizQuestions);

            // Send the modified questions to the backend
            const saveQuizResponse = await axios.post(
                'http://localhost:8000/api/question/saveQuestion',
                { quizQuestions: quizQuestions, videoId: videoDetails._id },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (saveQuizResponse.data.success) {
                alert('Quiz generated successfully!');
            } else {
                // alert('Failed to save quiz.');
                console.log("Failed to save the quiz");
            }
            navigate(`/quiz/${videoDetails._id}`);
        } catch (error) {
            console.error('Error generating quiz:', error.message);
            // alert(error.message);
        } finally {
            setLoading(false);
            navigate(`/quiz/${videoDetails._id}`);
        }
    };

    if (loading) {
        return (
            <p className="min-w-full min-h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10" />
            </p>
        )
    }

    if (!videoDetails) {
        return <div className="min-w-full min-h-[20vh] flex items-center justify-center font-semibold text-2xl">No video details found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-[80vh] shadow-md rounded-lg">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">📹 Video Summary</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">{videoDetails.title}</h2>

                {/* Transcription Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 border-b-2 pb-2 mb-2">
                        🎤 Transcribed Text
                    </h3>
                    <p className="text-gray-600 text-base whitespace-pre-line">{videoDetails.transcription}</p>
                </div>

                {/* Summary Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 border-b-2 pb-2 mb-2">
                        📝 Summary
                    </h3>
                    <p className="text-gray-700 text-lg">{videoDetails.summary}</p>
                </div>

                {/* Quiz Button */}
                <button
                    className="w-full bg-[#2A3B5F] hover:bg-[#0B1930] text-white py-3 px-6 text-lg font-semibold rounded-md transition duration-300 cursor-pointer"
                    onClick={handleGenerateQuiz}
                >
                    🎯 Generate Quiz
                </button>
            </div>
        </div>
    );
};

export default SummaryPage;
