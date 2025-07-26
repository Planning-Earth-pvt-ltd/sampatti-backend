// routes/admin.ts
import { Router } from 'express';
import {adminLogin ,createAdmin,getAdmin,requestPasswordOTP,changePasswordAfterOTP,verifyOTP} from '../controller/adminLogin.controller'

const router = Router();
router.post('/login', adminLogin);
router.post('/create', createAdmin); 
router.get('/getadmin',getAdmin)
router.post("/send_otp", requestPasswordOTP);
router.post("/verify_otp", verifyOTP);
router.post("/update_password", changePasswordAfterOTP);

export default router;
