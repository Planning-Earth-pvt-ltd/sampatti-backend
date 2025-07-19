import { Router } from 'express';
import {
  createOwner,
  getAllOwners,
  getOwnerById,
  updateOwner,
  deleteOwner,
  assignPropertyToOwner
} from '../controller/ownerUser.controller';

const router = Router();

router.post('/owners', createOwner);
router.get('/owners', getAllOwners);
router.get('/owners/:id', getOwnerById);
router.put('/owners/:id', updateOwner);
router.post('/owners/buy-property', assignPropertyToOwner);
router.delete('/owners/:id', deleteOwner);

export default router;