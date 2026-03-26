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

let dbConfig: any = {
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: { rejectUnauthorized: false }
};

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  try {
    // Manual parsing to avoid regex errors or driver-level URL parser quirks
    const url = new URL(dbUrl);
    dbConfig.user = decodeURIComponent(url.username);
    dbConfig.password = decodeURIComponent(url.password);
    dbConfig.host = url.hostname;
    dbConfig.port = parseInt(url.port);
    dbConfig.database = url.pathname.substring(1).split('?')[0]; // remove leading slash and query
  } catch (e) {
    console.warn('[DB] Failed to parse DATABASE_URL as URL object, using it as raw string.');
    dbConfig.connectionString = dbUrl;
  }
} else {
  dbConfig.connectionString = 'postgresql://postgres:postgres@localhost:5432/poketcg';
}

const pool = new Pool(dbConfig);
console.log('Database initialized for host:', dbConfig.host || 'local');

export const db = {
  query: async (text: string, params?: any[]) => {
    return pool.query(text, params);
  }
};
