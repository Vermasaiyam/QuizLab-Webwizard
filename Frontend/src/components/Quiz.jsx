import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import 'react-circular-progressbar/dist/styles.css';
import { CircularProgressbar } from 'react-circular-progressbar';

const QuizPage = () => {
    const { id } = useParams();
    const [questions, setQuestions] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [score, setScore] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/question/${id}/questions`);
                setQuestions(response.data.questions);
                setSelectedOptions(new Array(response.data.questions.length).fill(''));
            } catch (error) {
                console.error("Error fetching questions:", error.message);
            }
        };

        fetchQuestions();
    }, [id]);

    const handleOptionSelect = (index, option) => {
        const updatedOptions = [...selectedOptions];
        updatedOptions[currentQuestionIndex] = `${option}`;

        setSelectedOptions(updatedOptions);
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        let calculatedScore = 0;
        console.log("selected", selectedOptions);
        console.log("object", questions);


        questions.forEach((question, index) => {
            console.log(`Q${index + 1}: Correct Answer = ${question.correctAns}, Selected Option = ${selectedOptions[index]}`);

            if (selectedOptions[index] === question.correctAns[0]) {
                calculatedScore++;
            }
        });

        setScore(calculatedScore);
        setSubmitted(true);

        try {
            const response = await axios.post(`http://localhost:8000/api/video/${id}/score`, {
                videoId: id,
                score: calculatedScore,
            });
            console.log("Score saved successfully:", response.data);
        } catch (error) {
            console.error("Error saving score:", error.message);
        }
    };

    const currentQuestion = questions[currentQuestionIndex];

    const getCircleScore = () => {
        const percentage = (score / questions.length) * 100;

        return (
            <div className=" flex items-center justify-center" style={{ width: '100px', height: '100px' }}>
                <CircularProgressbar
                    value={percentage}
                    text={`${score}/${questions.length}`}
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

    return (
        <div className="max-w-4xl min-h-[80vh] mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-6">Quiz</h1>
            {!submitted ? (
                <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-2xl">
                    {currentQuestion ? (
                        <>
                            {/* Question Title */}
                            <h2 className="text-xl font-semibold mb-6 text-gray-800">
                                {`Q${currentQuestionIndex + 1}. ${currentQuestion.question}`}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuestion.options.map((option, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${currentQuestionIndex}`}
                                            value={option}
                                            checked={selectedOptions[currentQuestionIndex] === option}
                                            onChange={() => handleOptionSelect(index, option)}
                                            className="w-5 h-5 text-blue-500 cursor-pointer"
                                        />
                                        <span className="text-gray-700 text-lg">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="min-h-[80vh] flex items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                        </div>
                    )}

                    <div className="flex justify-between mt-8">
                        <button
                            className="bg-gray-300 text-gray-700 py-2 px-5 rounded-lg font-medium transition hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            onClick={handlePrevious}
                            disabled={currentQuestionIndex === 0 || submitted}
                        >
                            Previous
                        </button>

                        {currentQuestionIndex === questions.length - 1 ? (
                            <button
                                className="bg-[#2A3B5F] hover:bg-[#0B1930] text-white py-2 px-6 rounded-lg font-medium transition hover:bg-green-600 cursor-pointer"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        ) : (
                            <button
                                className="bg-blue-500 text-white py-2 px-6 rounded-lg font-medium transition hover:bg-blue-600 cursor-pointer"
                                onClick={handleNext}
                            >
                                Next
                            </button>
                        )}
                    </div>
                </div>

            ) : (
                <div className="text-center py-8 px-4 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
                    <h2 className="text-3xl font-semibold text-gray-800">Quiz Completed!</h2>
                    <p className="text-lg mt-4 text-gray-600">Your Score:</p>
                    <div className="mt-6 flex items-center justify-center space-x-4">
                        <div className="w-32 h-32">
                            {getCircleScore()}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Correct Answers:</h3>
                        <ul className="list-disc list-inside text-lg text-gray-800">
                            {questions.map((question, index) => (
                                <li key={index} className="flex flex-col space-y-2 mb-4">
                                    <div className="flex items-center space-x-2">
                                        <strong className="text-lg text-gray-900">Q{index + 1}:</strong>
                                        <span className="flex-1 text-gray-700">{selectedOptions[index] || "No Answer Selected"}</span>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <strong className="text-gray-900">Correct Answer:</strong> {question.correctAns[0]}
                                    </div>

                                    {selectedOptions[index] === question.correctAns[0] ? (
                                        <span className="text-green-500 font-medium">✔️ Correct</span>
                                    ) : (
                                        <span className="text-red-500 font-medium">❌ Incorrect</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-6">
                        <button
                            className="w-full bg-[#2A3B5F] hover:bg-[#0B1930] text-white py-3 px-6 text-lg font-semibold rounded-md transition duration-300"
                            onClick={() => navigate('/history')}
                        >
                            📜 View History
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;