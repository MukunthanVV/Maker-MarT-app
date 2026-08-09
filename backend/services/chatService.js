import prisma from '../config/prisma.js';

export const getChatsForUser = async (userId) => {
    return await prisma.chat.findMany({
        where: {
            OR: [
                { buyer_id: userId },
                { seller_id: userId }
            ]
        },
        include: {
            component: { select: { id: true, title: true, image_url: true } },
            buyer: { select: { id: true, name: true, email: true, avatar_url: true } },
            seller: { select: { id: true, name: true, email: true, avatar_url: true } },
            messages: {
                orderBy: { createdAt: 'desc' }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });
};

export const getChatById = async (chatId, userId) => {
    return await prisma.chat.findFirst({
        where: {
            id: chatId,
            OR: [
                { buyer_id: userId },
                { seller_id: userId }
            ]
        },
        include: {
            component: { select: { id: true, title: true, image_url: true, price: true } },
            buyer: { select: { id: true, name: true, email: true, avatar_url: true } },
            seller: { select: { id: true, name: true, email: true, avatar_url: true } },
        }
    });
};

export const getOrCreateChat = async (buyerId, sellerId, componentId) => {
    // Check if chat already exists
    let chat = await prisma.chat.findFirst({
        where: {
            buyer_id: buyerId,
            seller_id: sellerId,
            component_id: componentId
        }
    });

    if (!chat) {
        chat = await prisma.chat.create({
            data: {
                buyer_id: buyerId,
                seller_id: sellerId,
                component_id: componentId
            }
        });
    }

    return chat;
};
