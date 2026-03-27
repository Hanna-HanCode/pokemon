import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function forceSeed() {
  console.log('--- Force Seeding Perfect Order (me3) ---');
  try {
    // 1. Insert Set
    await pool.query(`
      INSERT INTO sets (id, name, series, printed_total, total, release_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        series = EXCLUDED.series,
        release_date = EXCLUDED.release_date
    `, ['me3', 'Perfect Order', 'Mega Evolution', 124, 124, '2026/03/27']);

    // 2. Insert Main Cards (Placeholder data based on web search)
    const cards = [
      { id: 'me3-1', name: 'Mega Zygarde ex', number: '1', rarity: 'Special Illustration Rare', type: 'Dragon' },
      { id: 'me3-2', name: 'Mega Clefable ex', number: '2', rarity: 'Rare Holo ex', type: 'Psychic' },
      { id: 'me3-3', name: 'Mega Starmie ex', number: '3', rarity: 'Rare Holo ex', type: 'Water' },
      { id: 'me3-4', name: 'Mega Skarmory ex', number: '4', rarity: 'Rare Holo ex', type: 'Metal' }
    ];

    for (const c of cards) {
      await pool.query(`
        INSERT INTO cards (id, name, "set", image, collector_number, rarity, supertype, types, set_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [
        c.id, c.name, 'Perfect Order', 
        `https://images.pokemontcg.io/me1/1_hires.png`, // Using me1-1 as placeholder image
        c.number, c.rarity, 'Pokémon', c.type, 'me3'
      ]);
    }

    console.log('[OK] Set me3 and 4 initial cards seeded.');
  } catch (err) {
    console.error('[ERROR]', err.message);
  } finally {
    await pool.end();
  }
}

forceSeed();
