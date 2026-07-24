import prisma from '../config/prisma.js';

export const getUserById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
    });
};

export const getAllUsers = async () => {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const upsertUser = async (id, email) => {
    return await prisma.user.upsert({
        where: { id },
        update: {}, // ignore duplicates conceptually
        create: {
            id,
            email,
        },
    });
};

export const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data,
    });
};
