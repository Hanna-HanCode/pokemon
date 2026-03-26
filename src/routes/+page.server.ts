import { db } from '$lib/db/index.js';

export async function load() {
    try {
        // Query to get all cards and their most recent daily stats
        const { rows: stats } = await db.query(`
            WITH LatestStats AS (
                SELECT DISTINCT ON (card_id, language) *
                FROM daily_stats
                ORDER BY card_id, language, date DESC
            )
            SELECT 
                c.id, c.name, c.set, c.image,
                ls.language, ls.avg_price, ls.min_price, ls.max_price, ls.listing_count, ls.date
            FROM cards c
            LEFT JOIN LatestStats ls ON c.id = ls.card_id
            ORDER BY c.name ASC, ls.language ASC
        `);
        console.log(`[LOAD] Found ${stats.length} rows for stats display.`);
        if (stats.length > 0) {
            console.log(`[LOAD] Sample row:`, JSON.stringify(stats[0]));
        }
        
        return { stats };
    } catch (error: any) {
        console.error("[LOAD] Error loading stats:", error.message);
        return { stats: [] };
    }
}
