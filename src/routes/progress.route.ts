import express from 'express';
import { listProperties,listHomeProps,getFilteredProperties } from '../controller/progress.controller';

const router = express.Router();




router.get('/GET_PROPERTY', listProperties);
router.get('/property_home', listHomeProps);
router.get('/filter', getFilteredProperties);

export default router;
