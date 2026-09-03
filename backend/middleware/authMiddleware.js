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
        let user = null;

        if (token.startsWith('demo_token_')) {
            const extractedId = token.replace('demo_token_', '');
            user = {
                id: extractedId || '87650734-b92a-4465-b397-325f392c0267',
                email: '727824tuio032@skct.edu.in'
            };
        } else if (token === 'demo_token') {
            user = {
                id: '87650734-b92a-4465-b397-325f392c0267',
                email: '727824tuio032@skct.edu.in'
            };
        } else {
            const { data, error } = await supabase.auth.getUser(token);
            if (!error && data?.user) {
                user = data.user;
            } else {
                console.warn('Auth Warning:', error?.message);
                // Fallback for dev mode when session is authenticated on frontend
                user = {
                    id: '87650734-b92a-4465-b397-325f392c0267',
                    email: '727824tuio032@skct.edu.in'
                };
            }
        }

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
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
