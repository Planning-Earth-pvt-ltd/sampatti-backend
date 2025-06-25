import express from "express";
import { sendOTP, verifyOTP } from "../controller/user.controller";

const router = express.Router();

router.route("/sendOTP").post(sendOTP);
router.route("/verifyOTP").post(verifyOTP);

export default router;
