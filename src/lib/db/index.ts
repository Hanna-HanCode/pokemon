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
    let user = decodeURIComponent(url.username);
    
    // FORCE project ID if it's missing from username (Required for Pooler/Supavisor)
    if (!user.includes('.') && (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.com'))) {
      user = `${user}.bzrswpkwqiaiudcdeuya`;
    }

    dbConfig.user = user;
    dbConfig.password = decodeURIComponent(url.password);
    dbConfig.host = url.hostname;
    
    // FORCE pooler port (6543) for Supabase hostnames to ensure IPv4 compatibility
    if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.com')) {
      dbConfig.port = 6543;
    } else {
      dbConfig.port = parseInt(url.port) || 5432;
    }

    dbConfig.database = url.pathname.substring(1).split('?')[0]; 
    
    console.log(`[DB] Connecting to ${dbConfig.host}:${dbConfig.port} as ${dbConfig.user}`);
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
