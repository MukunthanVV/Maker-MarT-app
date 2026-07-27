import express from 'express';
import { getNews, getLiveNews } from '../controllers/newsController.js';

const router = express.Router();

// Public route to get tech news
router.get('/', getNews);

// Public route to get live general news by source
router.get('/live', getLiveNews);

export default router;
