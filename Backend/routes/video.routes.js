import express from "express";
import { uploadVideo, uploadTranscription, getVideoDetails, storeScore, deleteVideo } from "../controllers/video.controller.js";
import Authenticated from "../middlewares/Authenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/uploadVideo').post(Authenticated, upload.single('file'), uploadVideo);
router.route('/uploadTranscription').post(Authenticated, uploadTranscription);
router.route('/summary/:id').get(Authenticated, getVideoDetails);
router.route('/:videoId/score').post(storeScore);
router.delete("/delete/:videoId", deleteVideo);

export default router;