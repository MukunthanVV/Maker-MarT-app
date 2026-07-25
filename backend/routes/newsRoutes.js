import express from 'express';
import { getLiveNews } from '../services/newsService.js';

const router = express.Router();

// GET /api/news
router.get('/', async (req, res, next) => {
  try {
    const news = await getLiveNews();
    res.json(news);
  } catch (error) {
    next(error);
  }
});

export default router;
