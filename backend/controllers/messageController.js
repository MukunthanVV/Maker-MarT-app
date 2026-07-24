import * as MessageService from '../services/messageService.js';
import * as ChatService from '../services/chatService.js';
import { emitNewMessage } from '../services/socketService.js';

export const getMessages = async (req, res, next) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        
        const chatIdsArray = chatId.split(',');
        
        // Ensure user is part of ALL requested chats
        const userChats = await ChatService.getChatsForUser(userId);
        const userChatIds = userChats.map(c => c.id);
        
        const isAuthorized = chatIdsArray.every(id => userChatIds.includes(id));
        if (!isAuthorized) return res.status(403).json({ error: 'Forbidden' });
        
        const messages = await MessageService.getMessagesByChatId(chatIdsArray);
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

export const createMessage = async (req, res, next) => {
    try {
        const { chat_id, receiver_id, content } = req.body;
        const sender_id = req.user.id;
        
        if (!chat_id || !receiver_id || !content) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Ensure user is part of the chat
        const chat = await ChatService.getChatById(chat_id, sender_id);
        if (!chat) return res.status(403).json({ error: 'Forbidden' });

        const message = await MessageService.createMessage(chat_id, sender_id, receiver_id, content);
        emitNewMessage(message, receiver_id);
        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};
