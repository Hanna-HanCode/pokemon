import { runScraper } from './src/lib/services/scraper.js';
import { normalizeRawListing } from './src/lib/services/normalizers.js';
import { db } from './src/lib/db/index.js';

async function main() {
  console.log('Running quick repopulation for critical cards...');
  
  // Scraper currently doesn't take params but we can filter the result 
  // or modify the scraper to only target these cards.
  // Actually, I'll modify the DB query in runScraper temporarily or just use a custom loop.
  
  const { rows: cards } = await db.query(
    `SELECT id, name, "set", collector_number FROM cards WHERE name ILIKE '%Charizard%' OR name ILIKE '%Mew%' LIMIT 20`
  );
  
  console.log(`Found ${cards.length} cards to re-scrape.`);
  
  // Custom minimal scraper loop
  const listings = await runScraper(cards); // I'll modify scraper.ts to accept an optional cards array
  
  console.log(`Scraper returned ${listings.length} listings.`);
  
  for (const item of listings) {
    const normalized = await normalizeRawListing(item);
    if (normalized.card_id && normalized.price) {
      await db.query(
        `INSERT INTO listings_normalized (card_id, price, condition, language, seller_name, collected_at) VALUES ($1, $2, $3, $4, $5, NOW());`,
        [normalized.card_id, normalized.price, normalized.condition, normalized.language, normalized.seller_name]
      );
    }
  }
  
  console.log('Quick repopulation complete.');
  process.exit(0);
}

main();
