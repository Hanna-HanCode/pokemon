import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkStats() {
  const res = await pool.query(`
    SELECT date, count(*) 
    FROM daily_stats 
    WHERE date >= '2026-03-25' 
    GROUP BY date 
    ORDER BY date DESC
  `);
  console.log('STATS BY DATE:', res.rows);
  await pool.end();
}

checkStats().catch(console.error);
