import { getStoredNews, fetchLiveNewsBySource } from '../services/newsService.js';

export const getNews = async (req, res, next) => {
    try {
        const news = await getStoredNews();
        res.status(200).json(news);
    } catch (error) {
        next(error);
    }
};

export const getLiveNews = async (req, res, next) => {
    try {
        const source = req.query.source || 'BBC';
        const news = await fetchLiveNewsBySource(source);
        res.status(200).json(news);
    } catch (error) {
        next(error);
    }
};
