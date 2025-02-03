import express from "express";
import { uploadVideo, uploadTranscription, getVideoDetails, storeScore } from "../controllers/video.controller.js";
import Authenticated from "../middlewares/Authenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Add multer middleware for file upload in uploadVideo route
router.route('/uploadVideo').post(Authenticated, upload.single('file'), uploadVideo);

// Route for uploading transcription
router.route('/uploadTranscription').post(Authenticated, uploadTranscription);
router.route('/summary/:id').get(Authenticated, getVideoDetails);
router.route('/:videoId/score').post( storeScore);

export default router;