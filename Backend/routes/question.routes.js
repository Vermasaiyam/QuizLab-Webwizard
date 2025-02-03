import express from "express";
import { getQuestions, saveQuestion } from "../controllers/quiz.controller.js";
import Authenticated from "../middlewares/Authenticated.js";

const router = express.Router();

router.route('/saveQuestion').post(saveQuestion);
router.route('/:id/questions').get(getQuestions);

export default router;