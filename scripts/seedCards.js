import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const API_URL = 'https://api.pokemontcg.io/v2/cards';
const PAGE_SIZE = 250;

async function seedCards() {
  let page = 1;
  let totalInserted = 0;
  let hasMore = true;

  console.log('--- Seeding Cards (with rarity/type) ---');

  while (hasMore) {
    try {
      console.log(`[API] Fetching page ${page} (pageSize=${PAGE_SIZE})...`);
      const response = await fetch(`${API_URL}?page=${page}&pageSize=${PAGE_SIZE}`);
      
      if (!response.ok) throw new Error(`API error: ${response.status} ${response.statusText}`);

      const data = await response.json();
      const cards = data.data;

      if (!cards || cards.length === 0) { hasMore = false; break; }

      console.log(`[SYNC] Processing ${cards.length} cards...`);
      
      let batchInserted = 0;
      for (const card of cards) {
        const { id, name, set, images, number, rarity, supertype, types } = card;
        const setName = set.name;
        const setId = set.id;
        const imageUrl = images.large || images.small;
        const typesStr = types ? types.join(',') : null;

        try {
          await pool.query(
            `INSERT INTO cards (id, name, "set", image, collector_number, rarity, supertype, types, set_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (id) DO UPDATE SET
               rarity = EXCLUDED.rarity,
               supertype = EXCLUDED.supertype,
               types = EXCLUDED.types,
               set_id = EXCLUDED.set_id,
               image = EXCLUDED.image`,
            [id, name, setName, imageUrl, number, rarity || null, supertype || null, typesStr, setId]
          );
          batchInserted++;
        } catch (dbErr) {
          console.error(`[DB] Error inserting ${id}:`, dbErr.message);
        }
      }

      totalInserted += batchInserted;
      console.log(`[PAGE ${page}] Done: ${batchInserted} cards. Total: ${totalInserted}`);

      if (cards.length < PAGE_SIZE) { hasMore = false; }
      else { page++; }

    } catch (err) {
      console.error(`[ERROR] Page ${page}:`, err.message);
      break;
    }
  }

  console.log(`--- Seeding Complete: ${totalInserted} cards ---`);
  await pool.end();
}

seedCards().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
