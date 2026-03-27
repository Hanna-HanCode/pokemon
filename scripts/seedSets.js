import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const API_URL = 'https://api.pokemontcg.io/v2/sets';

async function seedSets() {
  console.log('--- Seeding Sets ---');
  
  let page = 1;
  let totalInserted = 0;
  let hasMore = true;

  while (hasMore) {
    console.log(`[API] Fetching sets page ${page}...`);
    const res = await fetch(`${API_URL}?page=${page}&pageSize=250`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    
    const data = await res.json();
    const sets = data.data;

    if (!sets || sets.length === 0) { hasMore = false; break; }

    for (const s of sets) {
      await pool.query(
        `INSERT INTO sets (id, name, series, printed_total, total, logo, symbol, release_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           series = EXCLUDED.series,
           printed_total = EXCLUDED.printed_total,
           total = EXCLUDED.total,
           logo = EXCLUDED.logo,
           symbol = EXCLUDED.symbol,
           release_date = EXCLUDED.release_date`,
        [s.id, s.name, s.series, s.printedTotal, s.total, s.images?.logo, s.images?.symbol, s.releaseDate]
      );
      totalInserted++;
    }

    console.log(`[PAGE ${page}] Inserted ${sets.length} sets. Total: ${totalInserted}`);
    if (sets.length < 250) hasMore = false;
    else page++;
  }

  console.log(`--- Sets Seeding Complete: ${totalInserted} sets ---`);
  await pool.end();
}

seedSets().catch(err => { console.error('[FATAL]', err); process.exit(1); });
