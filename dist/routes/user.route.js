"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const router = express_1.default.Router();
router.route("/sendOTP").post(user_controller_1.sendOTP);
router.route("/verifyOTP").post(user_controller_1.verifyOTP);
exports.default = router;
