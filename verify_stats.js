import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const res = await pool.query("SELECT * FROM daily_stats WHERE date = '2026-03-26'");
  console.log('STATS 26th:', res.rows.length);
  if (res.rows.length > 0) {
      console.log('Sample:', res.rows[0]);
  }
  await pool.end();
}

check().catch(console.error);
