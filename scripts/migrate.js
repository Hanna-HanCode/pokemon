import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  console.log('--- Running Migration ---');

  // 1. Create sets table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sets (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      series VARCHAR(255) NOT NULL,
      printed_total INTEGER DEFAULT 0,
      total INTEGER DEFAULT 0,
      logo TEXT,
      symbol TEXT,
      release_date VARCHAR(20),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('[OK] Table "sets" created/verified.');

  // 2. Add new columns to cards (if not exists)
  const cols = [
    { name: 'rarity', type: 'VARCHAR(100)' },
    { name: 'supertype', type: 'VARCHAR(50)' },
    { name: 'types', type: 'TEXT' },
    { name: 'set_id', type: 'VARCHAR(50)' },
  ];

  for (const col of cols) {
    try {
      await pool.query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS ${col.name} ${col.type}`);
      console.log(`[OK] Column "cards.${col.name}" added/verified.`);
    } catch (e) {
      console.log(`[SKIP] Column "cards.${col.name}" already exists or error: ${e.message}`);
    }
  }

  console.log('--- Migration Complete ---');
  await pool.end();
}

migrate().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
