import { runScraper } from './src/lib/services/scraper.js';
import { normalizeRawListing } from './src/lib/services/normalizers.js';
import { db } from './src/lib/db/index.js';

async function main() {
  console.log('Running targeted repopulation for sm75-3...');
  
  const { rows: cards } = await db.query(
    `SELECT id, name, "set", collector_number FROM cards WHERE id = 'sm75-3'`
  );
  
  if (cards.length === 0) {
      console.error('Card sm75-3 not found!');
      process.exit(1);
  }

  const listings = await runScraper(cards);
  
  console.log(`Scraper returned ${listings.length} listings.`);
  
  for (const item of listings) {
    const normalized = await normalizeRawListing(item);
    if (normalized.card_id && normalized.price) {
      console.log(`Inserting: ${normalized.price} (${normalized.condition})`);
      await db.query(
        `INSERT INTO listings_normalized (card_id, price, condition, language, seller_name, collected_at) VALUES ($1, $2, $3, $4, $5, NOW());`,
        [normalized.card_id, normalized.price, normalized.condition, normalized.language, normalized.seller_name]
      );
    }
  }
  
  console.log('Targeted repopulation complete.');
  process.exit(0);
}

main();
