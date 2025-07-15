import express from 'express';
import {
  createTransactionAndOrder,
  verifyTransactionPayment,
  getUserTransactions,
  updateTransactionStatus,
  getTransactionById,
} from '../controller/transactionController';

const router = express.Router();

router.post('/create', createTransactionAndOrder);
router.post('/verify', verifyTransactionPayment);
router.get('/user/:userId', getUserTransactions);
router.get('/:id', getTransactionById);
router.put('/status/:id', updateTransactionStatus);

export default router;
