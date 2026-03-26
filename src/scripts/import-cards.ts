import { db } from '../lib/db/index.js';

async function fetchCards(query = 'set.id:base1') {
  console.log(`Fetching cards from pokemontcg.io with query: ${query}...`);
  const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&pageSize=50`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text.substring(0, 100)}`);
  }

  const data: any = await response.json();
  return data.data;
}

async function main() {
  try {
    // For MVP, let's fetch Charizard and Pikachu from Base Set specifically, 
    // or you can change the query to 'set.id:base1' for the whole set.
    const cards = await fetchCards('name:charizard OR name:pikachu');

    for (const card of cards) {
      console.log(`Importing ${card.name} (${card.id})...`);
      await db.query(`
        INSERT INTO cards (id, name, set, image)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          set = EXCLUDED.set,
          image = EXCLUDED.image
      `, [
        card.id,
        card.name,
        card.set.name,
        card.images.large
      ]);
    }

    console.log(`Successfully imported ${cards.length} cards.`);
    process.exit(0);
  } catch (err: any) {
    console.error('Error importing cards:', err.message);
    process.exit(1);
  }
}

main();
