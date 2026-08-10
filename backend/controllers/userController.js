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
        const immutableFields = ['id', 'email', 'createdAt', 'updatedAt', 'edit_count', 'last_edit_at', 'edit_request_status', 'is_profile_verified', 'pending_profile_updates', 'admin_suggestion'];
        
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
        const isChangingAccountDetails = Object.keys(sanitizedUpdates).some(k => 
            ['name', 'mobile_number', 'register_no', 'year', 'department', 'classroom_no'].includes(k)
        );

        if (isSelfProfileEdit) {
            if (isChangingAccountDetails) {
                const pendingProfile = {
                    name: sanitizedUpdates.name !== undefined ? sanitizedUpdates.name : (currentUser.name || ''),
                    mobile_number: sanitizedUpdates.mobile_number !== undefined ? sanitizedUpdates.mobile_number : (currentUser.mobile_number || ''),
                    register_no: sanitizedUpdates.register_no !== undefined ? sanitizedUpdates.register_no : (currentUser.register_no || ''),
                    year: sanitizedUpdates.year !== undefined ? sanitizedUpdates.year : (currentUser.year || ''),
                    department: sanitizedUpdates.department !== undefined ? sanitizedUpdates.department : (currentUser.department || ''),
                    classroom_no: sanitizedUpdates.classroom_no !== undefined ? sanitizedUpdates.classroom_no : (currentUser.classroom_no || ''),
                };

                sanitizedUpdates.pending_profile_updates = JSON.stringify(pendingProfile);

                // Strip the 6 fields from sanitizedUpdates so they aren't written to the User table directly
                delete sanitizedUpdates.name;
                delete sanitizedUpdates.mobile_number;
                delete sanitizedUpdates.register_no;
                delete sanitizedUpdates.year;
                delete sanitizedUpdates.department;
                delete sanitizedUpdates.classroom_no;

                sanitizedUpdates.is_profile_verified = false;
                sanitizedUpdates.edit_request_status = 'PENDING';
                sanitizedUpdates.admin_suggestion = null;
                sanitizedUpdates.last_edit_at = new Date();
            }
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
        
        const targetUser = await UserService.getUserById(id);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const updates = {
            edit_request_status: 'APPROVED',
            edit_count: 0,
            is_profile_verified: true
        };

        if (targetUser.pending_profile_updates) {
            try {
                const pending = JSON.parse(targetUser.pending_profile_updates);
                if (pending.name !== undefined) updates.name = pending.name;
                if (pending.mobile_number !== undefined) updates.mobile_number = pending.mobile_number;
                if (pending.register_no !== undefined) updates.register_no = pending.register_no;
                if (pending.year !== undefined) updates.year = pending.year;
                if (pending.department !== undefined) updates.department = pending.department;
                if (pending.classroom_no !== undefined) updates.classroom_no = pending.classroom_no;
                updates.pending_profile_updates = null;
            } catch (err) {
                console.error("Failed to parse pending_profile_updates on approval", err);
            }
        }
        
        const user = await UserService.updateUser(id, updates);
        emitUserUpdate(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

export const rejectEditAccess = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { suggestion } = req.body;
        
        const requester = await UserService.getUserById(req.user.id);
        const isAdmin = requester?.is_admin || requester?.role === 'Admin';
        if (!isAdmin) return res.status(403).json({ error: 'Forbidden: Admin access required' });
        
        const user = await UserService.updateUser(id, {
            edit_request_status: 'REJECTED',
            admin_suggestion: suggestion || 'Please correct your details.'
        });
        emitUserUpdate(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
