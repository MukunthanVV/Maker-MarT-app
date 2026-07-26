import express from 'express';
import * as MessageController from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/chat/:chatId', MessageController.getMessages);
router.post('/', MessageController.createMessage);

export default router;
