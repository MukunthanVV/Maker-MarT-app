import express from 'express';
import { getExternalHackathons } from '../services/scraperService.js';

const router = express.Router();

// GET /api/external-events/hackathons
router.get('/hackathons', async (req, res, next) => {
    try {
        const externalEvents = await getExternalHackathons();
        res.status(200).json(externalEvents);
    } catch (error) {
        next(error);
    }
});

export default router;
