import express from 'express';
import * as ChatController from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', ChatController.getMyChats);
router.get('/:id', ChatController.getChatById);
router.post('/', ChatController.getOrCreateChat);

export default router;
