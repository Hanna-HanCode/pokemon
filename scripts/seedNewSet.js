import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const SET_ID = 'me3'; 
const API_URL = `https://api.pokemontcg.io/v2/cards?q=set.id:${SET_ID}`;

async function seedNewSet() {
  console.log(`--- Seeding cards for set: ${SET_ID} ---`);
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    
    const data = await response.json();
    const cards = data.data;

    if (!cards || cards.length === 0) {
      console.log('No cards found for this set.');
      return;
    }

    console.log(`Found ${cards.length} cards. Syncing...`);

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

    console.log(`[OK] ${cards.length} cards synced for ${SET_ID}.`);

  } catch (err) {
    console.error('[ERROR]', err.message);
  } finally {
    await pool.end();
  }
}

seedNewSet();
