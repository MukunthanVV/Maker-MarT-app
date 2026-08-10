import express from 'express';
import * as MessageController from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { verifiedProfileMiddleware } from '../middleware/verifiedProfileMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/chat/:chatId', MessageController.getMessages);
router.post('/', verifiedProfileMiddleware, MessageController.createMessage);

export default router;
