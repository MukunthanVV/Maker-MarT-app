import { supabase } from '../config/supabase.js';
import * as UserService from '../services/userService.js';

const syncedUsers = new Set();

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth Error:', error);
            return res.status(401).json({ error: 'Unauthorized', details: error?.message });
        }

        req.user = user;

        // Ensure user is automatically upserted into Prisma
        if (!syncedUsers.has(user.id)) {
            try {
                await UserService.upsertUser(user.id, user.email);
                syncedUsers.add(user.id);
            } catch (upsertError) {
                console.error('Auto-sync upsert error:', upsertError);
            }
        }

        next();
    } catch (err) {
        console.error('Auth Middleware Exception:', err);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};
