import express from 'express';
import {
  cancelPaymentOrder,
  createPaymentOrder,
  verifyPayment
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/orders', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.post('/orders/:orderId/cancel', protect, cancelPaymentOrder);

export default router;
