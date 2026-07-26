import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

try {
  const prisma = new PrismaClient({ adapter });
  console.log("Success with adapter");
} catch (e) {
  console.log("Failed with adapter: " + e.message);
}
