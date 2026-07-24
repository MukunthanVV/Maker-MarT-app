import express from 'express';
import * as ComponentController from '../controllers/componentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', ComponentController.getComponents);
router.get('/:id', ComponentController.getComponentById);

// Protected routes
router.use(authMiddleware);
router.post('/', ComponentController.createComponent);
router.put('/:id', ComponentController.updateComponent);
router.delete('/:id', ComponentController.deleteComponent);

export default router;
