import express from 'express';
import { createOrderHandler, verifyPaymentHandler } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', createOrderHandler);
router.post('/verify', authMiddleware, verifyPaymentHandler);

export default router;
