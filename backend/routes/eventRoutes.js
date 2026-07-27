import express from 'express';
import { getEvents, createEvent } from '../controllers/eventController.js';

const router = express.Router();

// GET /api/events - Retrieve all live events
router.get('/', getEvents);

// POST /api/events - Create a new event
router.post('/', createEvent);

export default router;
