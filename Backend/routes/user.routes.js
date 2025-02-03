import express from "express";
import { editProfile, getProfile, login, logout, register, userData } from "../controllers/user.controller.js";
import Authenticated from "../middlewares/Authenticated.js";
import upload from "../middlewares/multer.js";


const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/:id/profile').get(Authenticated, getProfile);
router.route('/profile/edit').post(Authenticated, upload.single('profilePhoto'), editProfile);
router.route('/logout').get(logout);
router.route('/userData/:id').get(userData);

export default router;