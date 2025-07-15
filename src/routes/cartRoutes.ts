// cartRoutes.ts
import express from 'express';
import {
  addToCart, getUserCart, updateCartItem, deleteCartItem, clearCart,
} from '../controller/cartController';

const router = express.Router();

router.post('/addcart', addToCart);
router.get('/usercart/:userId', getUserCart);
router.put('/update/:id', updateCartItem);
router.delete('/deleteOne/:id', deleteCartItem);
router.delete('/clear/:userId', clearCart);

export default router;
