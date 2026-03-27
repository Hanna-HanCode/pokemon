import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Adding seller_name to listings_normalized...');
  try {
    await pool.query('ALTER TABLE listings_normalized ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255);');
    console.log('[OK] Column added.');
  } catch (err) {
    console.error('[ERROR]', err.message);
  } finally {
    await pool.end();
  }
}

run();
