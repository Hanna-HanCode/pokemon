import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

// Force bypass SSL for Supabase/SquareCloud
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

let connectionString = process.env.DATABASE_URL;

// If we have a connection string, strip sslmode to prevent driver conflicts
if (connectionString && connectionString.includes('sslmode=')) {
  connectionString = connectionString.replace(/([?&])sslmode=[^&]+/, '$1').replace(/[?&]$/, '');
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
});
console.log('Database URL configured:', process.env.DATABASE_URL ? 'YES' : 'NO (using local default)');

export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  }
};
