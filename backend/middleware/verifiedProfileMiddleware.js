import * as UserService from '../services/userService.js';

export const verifiedProfileMiddleware = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const dbUser = await UserService.getUserById(req.user.id);
        if (!dbUser) return res.status(404).json({ error: 'User profile not found' });
        
        // Admins bypass
        if (dbUser.is_admin || dbUser.role === 'Admin') {
            return next();
        }

        if (!dbUser.is_profile_verified) {
            return res.status(403).json({ error: 'Profile not verified. Access restricted until approved by admin.' });
        }

        next();
    } catch (err) {
        console.error('Verified Profile Middleware Exception:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
