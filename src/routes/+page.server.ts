import { db } from '$lib/db/index.js';

export async function load() {
    try {
        // Query to get all cards and their most recent daily stats
        const { rows: stats } = await db.query(`
            WITH LatestStats AS (
                SELECT DISTINCT ON (card_id) *
                FROM daily_stats
                ORDER BY card_id, date DESC
            )
            SELECT 
                c.id, c.name, c.set, c.image,
                ls.avg_price, ls.min_price, ls.max_price, ls.listing_count, ls.date
            FROM cards c
            LEFT JOIN LatestStats ls ON c.id = ls.card_id
            ORDER BY c.name ASC
        `);
        
        return { stats };
    } catch (error) {
        console.error("Error loading stats:", error);
        return { stats: [] };
    }
}
