import express from 'express';
import { createOrderHandler, verifyPaymentHandler } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { verifiedProfileMiddleware } from '../middleware/verifiedProfileMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.use(verifiedProfileMiddleware);

router.post('/create-order', createOrderHandler);
router.post('/verify', verifyPaymentHandler);

export default router;
