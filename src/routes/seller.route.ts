import express from "express";
import { OwnerAdd } from "../controller/seller.controller";

const router = express.Router();

router.post("/addOwner", OwnerAdd);

export default router;

 
