// transactionRoutes.ts
import express from 'express';
import {
  createTransaction, getUserTransactions, updateTransactionStatus, getTransactionById,
} from '../controller/transactionController';

const router = express.Router();

router.post('/', createTransaction);
router.get('/:userId', getUserTransactions);
router.get('/single/:id', getTransactionById);
router.put('/:id', updateTransactionStatus);

export default router;
