import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/poketcg',
  ssl: {
    rejectUnauthorized: false
  }
});
console.log('Database URL configured:', process.env.DATABASE_URL ? 'YES' : 'NO (using local default)');

export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  }
};
