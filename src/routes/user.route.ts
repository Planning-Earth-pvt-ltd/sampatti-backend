import express from "express";
import { sendOTP } from "../controller/user.controller";


const router = express.Router();

router.route("/sendOTP").post(sendOTP);

export default router;
