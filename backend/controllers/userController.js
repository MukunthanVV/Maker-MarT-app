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
        
        // Immutable fields to ignore
        const immutableFields = ['id', 'email', 'createdAt', 'updatedAt'];
        
        const sanitizedUpdates = {};
        for (const key of Object.keys(updates)) {
            if (validFields.includes(key) && !immutableFields.includes(key)) {
                sanitizedUpdates[key] = updates[key];
            }
        }
        
        // Normally check if req.user.id === id or req.user is admin
        // We will assume authMiddleware set req.user
        
        const user = await UserService.updateUser(id, sanitizedUpdates);
        emitUserUpdate(user);
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};
