import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const DB_FILE = path.join(process.cwd(), 'data', 'mock_db.json');

const defaultDb = {
    user: [],
    component: [],
    order: [],
    chat: [],
    message: [],
    event: [],
    news: [],
    problemStatement: []
};

let db = { ...defaultDb };

if (fs.existsSync(DB_FILE)) {
    try {
        db = { ...defaultDb, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) };
    } catch (e) {
        console.error("Failed to load mock_db.json", e);
    }
}

const saveDb = () => {
    try {
        if (!fs.existsSync(path.dirname(DB_FILE))) {
            fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
        }
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error("Failed to save mock_db.json", e);
    }
};

const createMockModel = (modelName) => ({
    findMany: async (args = {}) => {
        let results = [...db[modelName]];
        if (args.include?.seller) {
            results = results.map(item => ({
                ...item,
                seller: db.user.find(u => u.id === item.seller_id) || null
            }));
        }
        return results;
    },
    findUnique: async (args) => {
        let item = db[modelName].find(item => item.id === args.where.id) || null;
        if (item && args.include?.seller) {
            item = { ...item, seller: db.user.find(u => u.id === item.seller_id) || null };
        }
        return item;
    },
    findFirst: async (args) => {
        let item = db[modelName].find(item => {
            if (!args.where) return true;
            for (const key in args.where) {
                if (item[key] !== args.where[key]) return false;
            }
            return true;
        }) || null;
        if (item && args.include?.seller) {
            item = { ...item, seller: db.user.find(u => u.id === item.seller_id) || null };
        }
        return item;
    },
    create: async (args) => {
        const newItem = { id: Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date(), ...args.data };
        db[modelName].push(newItem);
        saveDb();
        return newItem;
    },
    update: async (args) => {
        const idx = db[modelName].findIndex(item => item.id === args.where.id);
        if (idx !== -1) {
            db[modelName][idx] = { ...db[modelName][idx], ...args.data, updatedAt: new Date() };
            saveDb();
            return db[modelName][idx];
        }
        throw new Error('Not found');
    },
    upsert: async (args) => {
        const idx = db[modelName].findIndex(item => item.id === args.where.id);
        if (idx !== -1) {
            db[modelName][idx] = { ...db[modelName][idx], ...args.update, updatedAt: new Date() };
            saveDb();
            return db[modelName][idx];
        }
        const newItem = { id: args.where.id || Math.random().toString(36).substr(2, 9), createdAt: new Date(), updatedAt: new Date(), ...args.create };
        db[modelName].push(newItem);
        saveDb();
        return newItem;
    },
    delete: async (args) => {
        const idx = db[modelName].findIndex(item => item.id === args.where.id);
        if (idx !== -1) {
            const deletedItem = db[modelName][idx];
            db[modelName].splice(idx, 1);
            saveDb();
            return deletedItem;
        }
        throw new Error('Not found');
    },
    deleteMany: async (args = {}) => {
        if (!args.where || Object.keys(args.where).length === 0) {
            db[modelName] = [];
        } else {
            db[modelName] = db[modelName].filter(item => {
                for (const key in args.where) {
                    if (item[key] !== args.where[key]) return true;
                }
                return false;
            });
        }
        saveDb();
        return { count: db[modelName].length };
    },
    createMany: async (args) => {
        const newItems = args.data.map(item => ({
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...item
        }));
        db[modelName].push(...newItems);
        saveDb();
        return { count: newItems.length };
    }
});

const prisma = {
    user: createMockModel('user'),
    component: createMockModel('component'),
    order: createMockModel('order'),
    chat: createMockModel('chat'),
    message: createMockModel('message'),
    event: createMockModel('event'),
    news: createMockModel('news'),
    problemStatement: createMockModel('problemStatement'),
};

export default prisma;
