import { db } from '../lib/db/index.js';

async function main() {
  await db.query(`
    INSERT INTO cards (id, name, set, image)
    VALUES 
      ('base1-4', 'Charizard', 'Base Set', 'https://images.pokemontcg.io/base1/4_hires.png'),
      ('base1-58', 'Pikachu', 'Base Set', 'https://images.pokemontcg.io/base1/58_hires.png')
    ON CONFLICT (id) DO NOTHING;
  `);
  console.log('Target cards seeded.');
  process.exit(0);
}

main();
