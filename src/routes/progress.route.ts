import express from 'express';
import { listProperties,listHomeProps} from '../controller/progress.controller';

const router = express.Router();




router.get('/GET_PROPERTY', listProperties);
router.get('/property_home', listHomeProps);

export default router;
