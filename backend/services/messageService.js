import prisma from '../config/prisma.js';

export const getMessagesByChatId = async (chatIds) => {
    const idArray = Array.isArray(chatIds) ? chatIds : chatIds.split(',');
    return await prisma.message.findMany({
        where: { chat_id: { in: idArray } },
        orderBy: { createdAt: 'asc' },
        include: {
            sender: { select: { id: true, name: true, avatar_url: true } }
        }
    });
};

export const createMessage = async (chatId, senderId, receiverId, content) => {
    const message = await prisma.message.create({
        data: {
            chat_id: chatId,
            sender_id: senderId,
            receiver_id: receiverId,
            content
        },
        include: {
            sender: { select: { id: true, name: true, avatar_url: true } }
        }
    });

    // Update chat's updatedAt timestamp
    await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
    });

    return message;
};
