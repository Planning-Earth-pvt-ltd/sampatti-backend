import express from 'express';
import {
  addProperty,
  updateProperty,
  listProperties,
  deleteProperty,
  getProperty,
  getPropertiesByStatus,
  getPropertiesByCategory,
  getPropertiesByOwner,
} from '../controller/property.controller';
import { handleMultipartData } from '../middlewares/upload';

const router = express.Router();    

router.post('/addproperty', handleMultipartData, addProperty);
router.put('/property/:id', handleMultipartData, updateProperty);
router.get('/GET_PROPERTY', listProperties);
router.get('/GET_PROPERTY/:id', getProperty);
router.delete('/property/:id', deleteProperty);
router.get('/status/:status', getPropertiesByStatus);
router.get('/category/:category', getPropertiesByCategory);
router.get('/owner/:ownerUserId', getPropertiesByOwner);

export default router;

