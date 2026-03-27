import cron from 'node-cron';
import { runScraper } from './scraper.js';
import { runStatsAggregator } from './statsAggregator.js';
import { normalizeRawListing } from './normalizers.js';
import { db } from '../db/index.js';

export function initCron() {
    console.log("Initializing Pokémon TCG Cron Manager...");

    const cronTask = async () => {
        console.log(`[${new Date().toISOString()}] Starting scheduled job (Scraper + Aggregator)...`);
        try {
            // 1. Run Scraper
            const listings = await runScraper();
            console.log(`Scraper found ${listings.length} raw listings.`);
            
            // 2. Process and Normalize
            for (const item of listings) {
                const { rows } = await db.query(
                    `INSERT INTO listings_raw (card_name, price_text, condition_text, seller_name, language) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
                    [item.card_name, item.price_text, item.condition_text, item.seller_name, item.language]
                );
                
                const normalized = await normalizeRawListing(item);
                if (normalized.card_id && normalized.price) {
                    await db.query(
                        `INSERT INTO listings_normalized (card_id, price, condition, language, collected_at) VALUES ($1, $2, $3, $4, NOW());`,
                        [normalized.card_id, normalized.price, normalized.condition, normalized.language]
                    );
                    await db.query(`UPDATE listings_raw SET processed = true WHERE id = $1;`, [rows[0].id]);
                }
            }

            // 3. Run Aggregator
            await runStatsAggregator();
            console.log(`[${new Date().toISOString()}] Job completed successfully.`);
        } catch (err) {
            console.error(`[${new Date().toISOString()}] Error in cron job:`, err);
        }
    };

    // Run once immediately on startup
    cronTask();

    // Schedule every hour (at minute 0)
    cron.schedule('0 * * * *', cronTask, {
        timezone: "America/Sao_Paulo"
    });
}
