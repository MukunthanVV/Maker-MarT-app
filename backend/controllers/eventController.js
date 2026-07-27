import prisma from '../config/prisma.js';

export const getEvents = async (req, res, next) => {
    try {
        const events = await prisma.event.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(events);
    } catch (error) {
        next(error);
    }
};

export const createEvent = async (req, res, next) => {
    try {
        const { title, description, buttonText, link, bgClass, textClass, btnClass } = req.body;
        
        const event = await prisma.event.create({
            data: {
                title,
                description,
                buttonText,
                link,
                bgClass,
                textClass,
                btnClass,
            },
        });
        
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};
