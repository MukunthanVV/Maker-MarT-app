import * as ChatService from '../services/chatService.js';
import { emitNewChat } from '../services/socketService.js';

export const getMyChats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const chats = await ChatService.getChatsForUser(userId);
        res.status(200).json(chats);
    } catch (error) {
        next(error);
    }
};

export const getChatById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const chat = await ChatService.getChatById(id, userId);
        if (!chat) return res.status(404).json({ error: 'Chat not found or unauthorized' });
        
        res.status(200).json(chat);
    } catch (error) {
        next(error);
    }
};

export const getOrCreateChat = async (req, res, next) => {
    try {
        const { seller_id, component_id } = req.body;
        const buyer_id = req.user.id;
        
        if (!seller_id || !component_id) {
            return res.status(400).json({ error: 'Missing seller_id or component_id' });
        }
        
        const chat = await ChatService.getOrCreateChat(buyer_id, seller_id, component_id);
        emitNewChat(chat, buyer_id, seller_id);
        res.status(200).json(chat);
    } catch (error) {
        next(error);
    }
};
