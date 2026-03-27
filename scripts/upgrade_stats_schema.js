import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Upgrading daily_stats to support per-condition history...');
  try {
    // 1. Add condition column
    await pool.query('ALTER TABLE daily_stats ADD COLUMN IF NOT EXISTS condition VARCHAR(50);');
    
    // 2. Drop unique constraint
    await pool.query('ALTER TABLE daily_stats DROP CONSTRAINT IF EXISTS daily_stats_date_card_id_language_key;');
    
    // 3. Add new unique constraint including condition
    await pool.query('ALTER TABLE daily_stats ADD CONSTRAINT daily_stats_unique_date_card_lang_cond UNIQUE (date, card_id, language, condition);');
    
    console.log('[OK] daily_stats upgraded.');
  } catch (err) {
    console.error('[ERROR]', err.message);
  } finally {
    await pool.end();
  }
}

run();
