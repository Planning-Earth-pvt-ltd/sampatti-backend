import express, { Request, Response } from 'express';
import {
  getAllUsers,
  getUserDetailsById,
  updateEmail,
  updateKycStatusAndVerification,
  updateTokens,
} from '../controller/u_Details.controller';

const router = express.Router();

router.get('/getusers', getAllUsers);
router.get('/bio/:id', getUserDetailsById);
router.put('/user_emails/:id', updateEmail);
router.put('/user_kyc/:id', updateKycStatusAndVerification);
router.put('/user_tokens/:id', updateTokens);

export default router;