// cartRoutes.ts
import express from 'express';
import {
  addToCart, getUserCart, updateCartItem, deleteCartItem, clearCart,
} from '../controller/cartController';

const router = express.Router();

router.post('/', addToCart);
router.get('/:userId', getUserCart);
router.put('/:id', updateCartItem);
router.delete('/:id', deleteCartItem);
router.delete('/clear/:userId', clearCart);

export default router;
