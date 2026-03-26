import cron from 'node-cron';
import { runScraper } from './scraper.js';
import { runStatsAggregator } from './statsAggregator.js';
import { normalizeRawListing } from './normalizers.js';
import { db } from '../db/index.js';

export function initCron() {
    console.log("Initializing Pokémon TCG Cron Manager...");

    // Schedule every hour
    cron.schedule('0 * * * *', async () => {
        console.log(`[${new Date().toISOString()}] Starting scheduled hourly job...`);
        
        try {
            // 1. Run Scraper
            const listings = await runScraper();
            
            // 2. Process and Normalize in-process
            for (const item of listings) {
                const { rows } = await db.query(
                    `INSERT INTO listings_raw (card_name, price_text, condition_text, seller_name) VALUES ($1, $2, $3, $4) RETURNING id;`,
                    [item.card_name, item.price_text, item.condition_text, item.seller_name]
                );
                
                const normalized = await normalizeRawListing(item);
                if (normalized.card_id && normalized.price) {
                    await db.query(
                        `INSERT INTO listings_normalized (card_id, price, condition, collected_at) VALUES ($1, $2, $3, NOW());`,
                        [normalized.card_id, normalized.price, normalized.condition]
                    );
                    await db.query(`UPDATE listings_raw SET processed = true WHERE id = $1;`, [rows[0].id]);
                }
            }

            // 3. Run Aggregator
            await runStatsAggregator();
            
            console.log(`[${new Date().toISOString()}] Hourly job completed successfully.`);
        } catch (err) {
            console.error(`[${new Date().toISOString()}] Error in hourly cron:`, err);
        }
    }, {
        timezone: "America/Sao_Paulo"
    });
}
