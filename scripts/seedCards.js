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
      
      console.log(`[SYNC] Processing ${cards.length} cards in batch...`);
      
      const ids = [];
      const names = [];
      const setNames = [];
      const images = [];
      const numbers = [];
      const rarities = [];
      const supertypes = [];
      const typesList = [];
      const setIds = [];

      for (const card of cards) {
        ids.push(card.id);
        names.push(card.name);
        setNames.push(card.set.name);
        images.push(card.images.large || card.images.small);
        numbers.push(card.number);
        rarities.push(card.rarity || null);
        supertypes.push(card.supertype || null);
        typesList.push(card.types ? card.types.join(',') : null);
        setIds.push(card.set.id);
      }

      try {
        await pool.query(
          `INSERT INTO cards (id, name, "set", image, collector_number, rarity, supertype, types, set_id)
           SELECT * FROM unnest($1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[], $8::text[], $9::text[])
           ON CONFLICT (id) DO UPDATE SET
             rarity = EXCLUDED.rarity,
             supertype = EXCLUDED.supertype,
             types = EXCLUDED.types,
             set_id = EXCLUDED.set_id,
             image = EXCLUDED.image`,
          [ids, names, setNames, images, numbers, rarities, supertypes, typesList, setIds]
        );
      } catch (dbErr) {
        console.error(`[DB] Batch error on page ${page}:`, dbErr.message);
      }

      totalInserted += cards.length;
      console.log(`[PAGE ${page}] Done: ${cards.length} cards. Total: ${totalInserted}`);

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
