import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Loader2, Trash2 } from "lucide-react";
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import { toast } from 'sonner';

const HistoryPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [videoDetails, setVideoDetails] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const selectedVideoRef = useRef(null);

    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        if (!user?._id) return;

        const fetchUserData = async () => {
            try {
                console.log("User ID:", user?._id);

                const response = await axios.get(`http://localhost:8000/api/user/userData/${user._id}`);
                console.log("API Response Data:", response.data);

                setHistory(Array.isArray(response.data.user.videos) ? response.data.user.videos : []);
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user?._id]);

    const handleVideoClick = (videoId) => {
        const selected = history.find((video) => video._id === videoId);
        setSelectedVideo(selected);
    };

    const handleAddNew = () => {
        navigate("/");
    };

    const totalScore = history.reduce((acc, video) => acc + (video.score || 0), 0);

    useEffect(() => {
        if (selectedVideoRef.current) {
            setTimeout(() => {
                selectedVideoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    }, [selectedVideo]);

    const handleDelete = async (videoId) => {
        try {
            setLoading(true);
            const response = await axios.delete(`http://localhost:8000/api/video/delete/${videoId}`, {
                data: { userId: user._id }
            });

            if (response.data.success) {
                toast.success("Video deleted successfully!");
                setHistory(history.filter(video => video._id !== videoId));
                if (selectedVideo?._id === videoId) setSelectedVideo(null);
            } else {
                toast.error("Failed to delete video.");
            }
        } catch (error) {
            console.error("Error deleting video:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const getCircleScore = () => {
        const percentage = (selectedVideo.score / selectedVideo.questions.length) * 100;

        return (
            <div className="relative flex items-center justify-center" style={{ width: '100px', height: '100px' }}>
                <CircularProgressbar
                    value={percentage}
                    text={`${selectedVideo.score}/${selectedVideo.questions.length}`}
                    strokeWidth={10}
                    styles={{
                        path: {
                            stroke: '#4CAF50',
                            strokeLinecap: 'round',
                        },
                        trail: {
                            stroke: '#e6e6e6',
                        },
                        text: {
                            fill: '#000',
                            fontSize: '20px',
                        },
                    }}
                />
            </div>
        );
    };

    const fetchVideoDetails = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/api/video/summary/${selectedVideo._id}`, {
                withCredentials: true, // Send cookies with request
            });
            if (response.data.success) {
                setVideoDetails(response.data.video);
            } else {
                toast.error("Failed to fetch video details.");
            }
        } catch (error) {
            // console.error("Error fetching video details:", error);
            toast.error("An error occurred while fetching video details.", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateQuiz = async () => {
        try {
            setLoading(true);

            await fetchVideoDetails();

            const transcription = videoDetails.transcription;

            const response = await axios.post(
                'http://127.0.0.1:5000/modify',
                {
                    modification_input: `Give me ${numQuestions} quiz questions from the text in JSON format, in the format of question as string, options as array of strings, correctAns as string.`,
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

            // console.log('Extracted JSON string:', jsonString);

            const quizQuestions = JSON.parse(jsonString);

            // console.log('Parsed quiz questions:', quizQuestions);

            // Send the modified questions to the backend
            const saveQuizResponse = await axios.post(
                'http://localhost:8000/api/question/saveQuestion',
                { quizQuestions: quizQuestions, videoId: videoDetails._id },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (saveQuizResponse.data.success) {
                toast.success('Quiz generated successfully!');
            } else {
                toast.error('Failed to save quiz.');
            }
            navigate(`/quiz/${videoDetails._id}`);
        } catch (error) {
            console.error('Error generating quiz:', error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
            navigate(`/quiz/${videoDetails._id}`);
        }
    };

    return (
        <div className="max-w-5xl min-h-[80vh] mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">History</h1>
                <button
                    onClick={handleAddNew}
                    className="bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition cursor-pointer"
                >
                    Add New +
                </button>
            </div>

            <div className="mb-6 p-4 flex items-center justify-between bg-gray-200 rounded-lg text-center text-xl font-semibold">
                <div className="flex items-center justify-center gap-4">
                    <img src="coin_gif.webp" alt="Gold Coin" className="h-8 w-8" />
                    Total Points Earned: {totalScore}
                </div>
                <button className="bg-blue-500 text-white py-1.5 px-2.5 text-sm rounded-md shadow hover:bg-blue-600 transition cursor-pointer">Reedem Now</button>
            </div>

            {loading ? (
                <p className="min-w-full min-h-[80vh] flex items-center justify-center">
                    <Loader2 className="w-10 h-10" />
                </p>
            ) : (
                <>
                    {history.length === 0 ? (
                        <p>No videos found.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {history.map((video) => (
                                <div
                                    key={video._id}
                                    className={`relative border rounded-lg p-4 shadow hover:shadow-2xl cursor-pointer transition ${selectedVideo?._id === video._id ? "shadow-2xl bg-gray-200" : ""
                                        }`}
                                    onClick={() => handleVideoClick(video._id)}
                                >
                                    <button
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-700 transition z-5"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(video._id);
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>

                                    {video.youTubeUrl ? (
                                        <Link
                                            to={video.youTubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="relative group block"
                                        >
                                            <img
                                                src={video.videoThumbnail || "/audio.jpeg"}
                                                alt="Video Thumbnail"
                                                className="w-full h-40 object-cover rounded-md transition-opacity duration-300"
                                            />

                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                                                {!video.videoThumbnail && (
                                                    <img
                                                        src="/audio.jpeg"
                                                        alt="Audio Placeholder"
                                                        className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 rounded-md"
                                                    />
                                                )}

                                                <img
                                                    src="/youtubeLogo.png"
                                                    alt="YouTube Logo"
                                                    className="w-12 h-12 z-10"
                                                />
                                            </div>
                                        </Link>
                                    ) : (
                                        <img
                                            src={video.videoThumbnail || "/audio.jpeg"}
                                            alt="Video Thumbnail"
                                            className="w-full h-40 object-cover rounded-md"
                                        />
                                    )}

                                    <h2 className="text-xl font-semibold mt-2">{video.title}</h2>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{video.summary}</p>
                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{video.transcription}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {selectedVideo && (
                        <div ref={selectedVideoRef} className="mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">

                            {selectedVideo.youTubeUrl && (
                                <Link
                                    to={selectedVideo.youTubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative group block"
                                >
                                    <img
                                        src={selectedVideo.videoThumbnail || "/audio.jpeg"}
                                        alt="Video Thumbnail"
                                        className="w-full h-40 object-cover rounded-md mb-4 transition-opacity duration-300"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md">
                                        {!selectedVideo.videoThumbnail && (
                                            <img
                                                src="/audio.jpeg"
                                                alt="Audio Placeholder"
                                                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-50 transition-opacity duration-300 rounded-md"
                                            />
                                        )}

                                        <img
                                            src="/youtubeLogoRed.png"
                                            alt="YouTube Logo"
                                            className="w-20 h-12 z-10"
                                        />
                                    </div>
                                </Link>
                            )}

                            <h2 className="text-2xl font-bold text-gray-800">{selectedVideo.title}</h2>
                            <p className="mt-4 text-gray-700 leading-relaxed">{selectedVideo.summary}</p>
                            <p className="mt-4 text-gray-600 leading-relaxed italic">{selectedVideo.transcription}</p>

                            {selectedVideo.questions && selectedVideo.questions.length > 0 ? (
                                <>
                                    <div className="mt-6 flex items-center gap-2">
                                        <span className="text-lg font-semibold text-gray-700">Score:</span>
                                        <div className="text-black px-3 py-1 rounded-full text-sm font-medium">
                                            {getCircleScore()}
                                        </div>
                                    </div>
                                    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quiz Questions</h3>
                                        <ul className="space-y-6">
                                            {selectedVideo.questions?.map((question, index) => (
                                                <li key={index} className="bg-gray-50 p-4 rounded-lg border">
                                                    <p className="font-medium text-gray-900">{question.question}</p>
                                                    <ul className="mt-3 space-y-2">
                                                        {question.options?.map((option, idx) => (
                                                            <li
                                                                key={idx}
                                                                className={`p-2 rounded-lg ${option === question.correctAns ? 'bg-green-100 text-green-700 font-semibold' : 'text-gray-700'
                                                                    }`}
                                                            >
                                                                {option} {option === question.correctAns && '✅'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <span className="font-semibold text-gray-800">Correct Answer:</span>
                                                        <span className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-medium">
                                                            {question.correctAns}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-6 text-center">
                                    <p className="text-lg font-semibold text-gray-700 mb-4">No quiz taken yet.</p>
                                    <label className="block text-gray-700 font-semibold mb-2">Select Number of Questions:</label>
                                    <select
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                                        className="w-full p-2 border rounded-md mb-4"
                                    >
                                        {[2, 5, 10, 15, 20].map((num) => (
                                            <option key={num} value={num}>{num} Questions</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleGenerateQuiz}
                                        className="w-full bg-[#2A3B5F] hover:bg-[#0B1930] text-white py-3 px-6 text-lg font-semibold rounded-md transition duration-300 cursor-pointer"
                                    >
                                        Take Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HistoryPage;