import { Server } from 'socket.io';
import { supabase } from '../config/supabase.js';

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) return next(new Error('Authentication error'));

            const { data: { user }, error } = await supabase.auth.getUser(token);
            if (error || !user) return next(new Error('Authentication error'));

            socket.user = user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        socket.join(userId);

        if (socket.user.email === 'tharunkarthikav21@gmail.com' || socket.user.is_admin) {
            socket.join('admin');
        }

        socket.on('disconnect', () => {
            // handle disconnect
        });
    });
};

export const getIo = () => io;

// Emitters structured to match exactly what Supabase postgres_changes sent to the frontend
export const emitNewMessage = (message, receiverId) => {
    if (!io) return;
    const payload = { new: message };
    // Emit to sender and receiver
    io.to(message.sender_id).to(receiverId).emit('postgres_changes:messages:INSERT', payload);
};

export const emitNewChat = (chat, buyerId, sellerId) => {
    if (!io) return;
    const payload = { new: chat };
    io.to(buyerId).to(sellerId).emit('postgres_changes:chats:INSERT', payload);
};

export const emitUserUpdate = (user) => {
    if (!io) return;
    const payload = { new: user };
    io.to('admin').emit('postgres_changes:users:UPDATE', payload);
};

export const emitComponentUpdate = (component) => {
    if (!io) return;
    const payload = { new: component };
    io.to('admin').emit('postgres_changes:components:UPDATE', payload);
};
