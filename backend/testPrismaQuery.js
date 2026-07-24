import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

async function test() {
  try {
    const prisma = new PrismaClient({ adapter });
    const users = await prisma.user.findMany();
    console.log("Query success! Users:", users.length);
  } catch (e) {
    console.log("Query failed: " + e.message);
  } finally {
    await pool.end();
  }
}
test();
