import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

// Force bypass SSL for Supabase/SquareCloud
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Ensure we don't wait forever if connection fails
  connectionTimeoutMillis: 5000,
});
console.log('Database URL configured:', process.env.DATABASE_URL ? 'YES' : 'NO (using local default)');

export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  }
};
