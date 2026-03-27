import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkListings() {
  const raw = await pool.query(`
    SELECT count(*) FROM listings_raw WHERE DATE(created_at) = '2026-03-26'
  `);
  const norm = await pool.query(`
    SELECT count(*) FROM listings_normalized WHERE DATE(collected_at) = '2026-03-26'
  `);
  console.log('RAW 26th:', raw.rows[0].count);
  console.log('NORM 26th:', norm.rows[0].count);
  await pool.end();
}

checkListings().catch(console.error);
