import { Prisma } from '@prisma/client';
import * as UserService from '../services/userService.js';
import { emitUserUpdate } from '../services/socketService.js';

export const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await UserService.getUserById(id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

export const upsertUser = async (req, res, next) => {
    try {
        const { id, email } = req.body;
        if (!id || !email) return res.status(400).json({ error: 'Missing required fields' });
        
        // Security check: Only the user themselves can upsert their record (usually on login)
        if (req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });

        const user = await UserService.upsertUser(id, email);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        // Dynamically get legitimate fields defined in the Prisma schema
        const validFields = Object.keys(Prisma.UserScalarFieldEnum);
        
        // Immutable fields to ignore from client-provided updates
        const immutableFields = ['id', 'email', 'createdAt', 'updatedAt', 'edit_count', 'last_edit_at', 'edit_request_status'];
        
        const sanitizedUpdates = {};
        for (const key of Object.keys(updates)) {
            if (validFields.includes(key) && !immutableFields.includes(key)) {
                sanitizedUpdates[key] = updates[key];
            }
        }
        
        // Fetch current user and requester
        const currentUser = await UserService.getUserById(id);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });

        const requester = await UserService.getUserById(req.user.id);
        const isAdmin = requester?.is_admin || requester?.role === 'Admin';
        
        // Security check
        if (req.user.id !== id && !isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        // Lock & Limit enforcement for regular user profile updates
        const isSelfProfileEdit = req.user.id === id && !isAdmin;
        // Check if they are actually changing fields (like name, mobile, etc.)
        const isChangingProfile = Object.keys(sanitizedUpdates).some(k => 
            ['name', 'mobile_number', 'register_no', 'year', 'department', 'classroom_no', 'bio', 'avatar_url'].includes(k)
        );

        if (isSelfProfileEdit && isChangingProfile) {
            const COOLDOWN_DAYS = 3;
            const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
            
            // 1. Check cooldown
            if (currentUser.last_edit_at) {
                const timeSinceLastEdit = Date.now() - new Date(currentUser.last_edit_at).getTime();
                if (timeSinceLastEdit < COOLDOWN_MS) {
                    const remainingDays = ((COOLDOWN_MS - timeSinceLastEdit) / (24 * 60 * 60 * 1000)).toFixed(1);
                    return res.status(400).json({ error: `Profile is locked. Next edit available in ${remainingDays} days.` });
                }
            }

            // 2. Check maximum edits
            if (currentUser.edit_count >= 3 && currentUser.edit_request_status !== 'APPROVED') {
                return res.status(400).json({ error: 'Maximum edits reached. Please request edit access from admin.' });
            }

            // 3. Update count & timestamps
            let newEditCount = (currentUser.edit_count || 0) + 1;
            if (currentUser.edit_request_status === 'APPROVED') {
                newEditCount = 1;
            }
            sanitizedUpdates.edit_count = newEditCount;
            sanitizedUpdates.last_edit_at = new Date();
            sanitizedUpdates.edit_request_status = null; // consume approval status
        }
        
        const user = await UserService.updateUser(id, sanitizedUpdates);
        emitUserUpdate(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const requestEditAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (req.user.id !== id) return res.status(403).json({ error: 'Forbidden' });
        
        const currentUser = await UserService.getUserById(id);
        if (!currentUser) return res.status(404).json({ error: 'User not found' });
        
        if (currentUser.edit_count < 3) {
            return res.status(400).json({ error: 'You still have available edits' });
        }

        const user = await UserService.updateUser(id, { edit_request_status: 'PENDING' });
        emitUserUpdate(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const approveEditAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const requester = await UserService.getUserById(req.user.id);
        const isAdmin = requester?.is_admin || requester?.role === 'Admin';
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
        
        const user = await UserService.updateUser(id, {
            edit_request_status: 'APPROVED',
            edit_count: 0 // Reset edit count to 0 so they can edit 3 more times
        });
        emitUserUpdate(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
