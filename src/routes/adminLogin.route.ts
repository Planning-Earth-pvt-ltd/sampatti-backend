// routes/admin.ts
import { Router } from 'express';
import { adminLogin } from '../controller/adminLogin.controller';
import { createAdmin } from '../controller/adminLogin.controller';
import {getAdmin} from '../controller/adminLogin.controller'
// import {requestPasswordReset} from "../controller/adminLogin.controller";
// import{ resetPasswordWithToken}from "../controller/adminLogin.controller"

const router = Router();
router.post('/login', adminLogin);
router.post('/create', createAdmin); 
router.get('/getadmin',getAdmin)
// router.post("/request-reset", requestPasswordReset);
// router.post("/reset-password", resetPasswordWithToken);

export default router;