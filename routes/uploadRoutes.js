import express from 'express';
import { getPresignedUrl, deleteUpload } from '../controllers/uploadController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/presigned-url', authMiddleware, getPresignedUrl);
router.delete('/:key', authMiddleware, deleteUpload);

export default router;
