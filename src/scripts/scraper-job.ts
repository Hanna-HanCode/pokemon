import { runScraper } from '../lib/services/scraper.js';
import { normalizeRawListing } from '../lib/services/normalizers.js';
import { db } from '../lib/db/index.js';

async function main() {
  console.log('Running scraper pipeline...');
  const listings = await runScraper();
  console.log(`Scraper returned ${listings.length} total listings.`);
  
  for (const item of listings) {
    console.log(`Processing item: ${item.card_name} - ${item.price_text} (${item.language})`);
    const { rows } = await db.query(
      `INSERT INTO listings_raw (card_name, price_text, condition_text, seller_name, language) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
      [item.card_name, item.price_text, item.condition_text, item.seller_name, item.language]
    );
    
    const normalized = await normalizeRawListing(item);
    console.log(`Normalized: ${JSON.stringify(normalized)}`);
    
    if (normalized.card_id && normalized.price) {
      console.log(`Inserting normalized listing for ${normalized.card_id}...`);
      await db.query(
        `INSERT INTO listings_normalized (card_id, price, condition, language, collected_at) VALUES ($1, $2, $3, $4, NOW());`,
        [normalized.card_id, normalized.price, normalized.condition, normalized.language]
      );
      await db.query(`UPDATE listings_raw SET processed = true WHERE id = $1;`, [rows[0].id]);
    }
  }
  
  console.log('Scraping and normalization complete.');
  process.exit(0);
}

main();
