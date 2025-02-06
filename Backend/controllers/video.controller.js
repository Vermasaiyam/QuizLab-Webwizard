import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import { Question } from "../models/question.model.js";

export const uploadVideo = async (req, res) => {
    try {
        const userId = req.id;
        const video = req.file;

        // Extract additional fields
        const { videoTitle, videoThumbnail, youTubeUrl } = req.body;

        if (!video) {
            return res.status(400).json({
                message: 'No video file uploaded.',
                success: false
            });
        }

        // Upload the video to Cloudinary
        const fileUri = getDataUri(video);
        const cloudResponse = await cloudinary.uploader.upload(fileUri, {
            resource_type: "video", // Specify the resource type as video
        });

        const newVideo = new Video({
            videoUrl: cloudResponse.secure_url,
            title: videoTitle || video.originalname,
            videoThumbnail,
            youTubeUrl: youTubeUrl || "",
            summary: "Default summary",
        });
        

        // Save the new Video document to the database
        await newVideo.save();

        // Find the user and add the new video's ID to their videos array
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        }

        user.videos = user.videos || []; // Ensure videos is an array
        user.videos.push(newVideo._id); // Push the new video's ID to the user's videos array

        // Save the updated user document
        await user.save();

        return res.status(200).json({
            message: 'Video uploaded successfully.',
            success: true,
            video: newVideo, // Return the new video object
            user, // Return the updated user object
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to upload video.',
            success: false,
        });
    }
};

export const uploadTranscription = async (req, res) => {
    try {
        const userId = req.id;
        const { videoId, transcription, summary, title, thumbnail } = req.body;

        if (!transcription) {
            return res.status(400).json({
                message: 'Transcription missing.',
                success: false,
            });
        }
        if (!summary) {
            return res.status(400).json({
                message: 'Summary missing.',
                success: false,
            });
        }
        if (!videoId) {
            return res.status(400).json({
                message: 'Video ID missing.',
                success: false,
            });
        }

        const user = await User.findById(userId).select('-password').populate('videos');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false,
            });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({
                message: 'Video not found.',
                success: false,
            });
        }

        video.transcription = transcription;
        video.summary = summary;
        video.videoThumbnail = thumbnail || "";
        if (title){
            video.title = title;
        }

        await video.save();

        return res.status(200).json({
            message: 'Transcription updated successfully.',
            success: true,
            video,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to update transcription.',
            success: false,
        });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const { videoId } = req.params;
        const { userId } = req.body;

        if (!videoId || !userId) {
            return res.status(400).json({ success: false, message: "Video ID and User ID are required." });
        }

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ success: false, message: "Video not found." });
        }

        // Delete all associated questions
        await Question.deleteMany({ videoId });

        await User.findByIdAndUpdate(userId, { $pull: { videos: videoId } });

        await Video.findByIdAndDelete(videoId);

        return res.status(200).json({ success: true, message: "Video and associated questions deleted successfully." });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}

export const getVideoDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the video by ID, assuming 'Video' is your model
        const video = await Video.findById(id); // You can populate the 'user' field if needed

        if (!video) {
            return res.status(404).json({
                message: 'Video not found.',
                success: false,
            });
        }

        // Return the video details, including the summary and any other required fields
        return res.status(200).json({
            success: true,
            video: {
                _id: video._id,
                title: video.title,
                summary: video.summary ?? "NA",
                videoUrl: video.videoUrl,
                transcription: video.transcription,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: 'Failed to fetch video details.',
            success: false,
        });
    }
};

export const storeScore = async (req, res) => {
    const { videoId } = req.params;
    const { score } = req.body;

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).send("Video not found");
        }

        video.score = score;  // Assuming there's a `score` field in the video schema
        await video.save();

        res.status(200).send({ message: 'Score saved successfully', score });
    } catch (error) {
        res.status(500).send({ error: 'Failed to save score' });
    }
}