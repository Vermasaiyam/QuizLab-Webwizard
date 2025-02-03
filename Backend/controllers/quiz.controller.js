import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Question } from "../models/question.model.js";
import mongoose from "mongoose";

export const saveQuestion = async (req, res) => {
    try {
        const { quizQuestions, videoId, userId } = req.body;

        console.log("Received Quiz Questions:", quizQuestions);

        // Step 1: Create Question documents
        const questions = [];
        for (let index = 0; index < quizQuestions.length; index++) {
            const existingQuestion = await Question.findOne({ question: quizQuestions[index].question });

            if (existingQuestion) {
                // Question already exists, do not insert
                console.log(`Skipping question: "${quizQuestions[index].question}" because it already exists.`);
                continue;
            }

            const question = new Question({
                question: quizQuestions[index].question,
                options: quizQuestions[index].options,
                correctAns: quizQuestions[index].correctAns,
                videoId: videoId, // Associate question with video
            });

            // Save the question and push to questions array
            const savedQuestion = await question.save();
            questions.push(savedQuestion._id);
        }

        // Step 2: Update the Video model with the new question IDs
        const video = await Video.findByIdAndUpdate(
            videoId,
            { $push: { questions: { $each: questions } } },
            { new: true }
        );

        if (!video) {
            return res.status(404).json({
                success: false,
                message: "Video not found.",
            });
        }

        // Step 3: Update the User model with the new video information
        const user = await User.findByIdAndUpdate(
            userId,
            { $push: { videos: { $each: [{ videoId: video._id, questions: questions }] } } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Return success response
        res.status(200).json({
            success: true,
            message: "Quiz questions saved successfully and video updated.",
            videoId: video._id,
            userId: user._id,
        });
    } catch (error) {
        console.error("Error saving quiz:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to save quiz.",
            error: error.message,
        });
    }
};

export const getQuestions = async (req, res) => {
    try {
        const { id } = req.params;

        // Populate questions based on the videoId
        const video = await Video.findById(id).populate('questions');

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.status(200).json({ questions: video.questions });
    } catch (error) {
        console.error('Error fetching questions:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};