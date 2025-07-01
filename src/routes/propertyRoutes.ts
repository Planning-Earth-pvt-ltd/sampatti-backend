import { Router } from 'express';
import {
  addProperty,
  listProperties,
  updateProperty,
  deleteProperty,
} from '../controller/propertyController';

const router = Router();

router.post('/addproperty', addProperty);
router.get('/list-property', listProperties);
router.put('/property/:id', updateProperty);
router.delete('/property/:id', deleteProperty);

export default router;
