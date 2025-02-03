import React, { useState, useEffect } from "react";

const carouselTexts = [
    "Transform YouTube videos into interactive quizzes and insightful summaries.",
    "Create engaging quizzes and summaries from videos effortlessly.",
    "Enhance learning with AI-powered video-to-quiz and summary generation.",
    "Convert any YouTube video into an interactive learning experience.",
    "Build, edit, and track educational content with ease."
];

const TextCarousel = () => {
    const [index, setIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out before changing text
            setIsVisible(false);

            setTimeout(() => {
                setIndex((prevIndex) => (prevIndex + 1) % carouselTexts.length);
                setIsVisible(true); // Fade in new text
            }, 500); // Half-second fade-out delay before text change
        }, 3000); // Change text every 4 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center min-w-full max-w-full mx-auto px-4">
            {/* Animated Heading */}
            <h1
                key={index} // Forces re-render
                className={`text-3xl md:text-4xl font-extrabold my-6 text-white transition-opacity transform duration-500 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
            >
                {carouselTexts[index]}
            </h1>

            {/* Subtitle */}
            <p className="mt-2 text-lg md:text-xl text-gray-300 my-6 mb-8">
                Transform YouTube videos or audio into engaging quizzes and summaries,
                providing your audience with an interactive learning experience.
                Easily build, edit, and track the content through the platform.
            </p>
        </div>
    );
};

export default TextCarousel;