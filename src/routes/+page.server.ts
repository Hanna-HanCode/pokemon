import { db } from '$lib/db/index.js';

export const prerender = false;

export async function load() {
    try {
        // Only fetch cards that have real stats, ordered by relevance
        const { rows: stats } = await db.query(`
            WITH LatestStats AS (
                SELECT DISTINCT ON (card_id, language) *
                FROM daily_stats
                ORDER BY card_id, language, date DESC
            )
            SELECT 
                c.id, c.name, c.set, c.image,
                ls.language, ls.avg_price, ls.min_price, ls.max_price, ls.listing_count,
                TO_CHAR(ls.date, 'DD/MM/YYYY') as date
            FROM cards c
            INNER JOIN LatestStats ls ON c.id = ls.card_id
            ORDER BY ls.listing_count DESC, ls.avg_price DESC
            LIMIT 30
        `);
        console.log(`[LOAD] Found ${stats.length} rows for homepage display.`);

        // Identify top 10 unique card IDs as "popular"
        const seen = new Set<string>();
        const popularIds = new Set<string>();
        for (const row of stats) {
            if (!seen.has(row.id)) {
                seen.add(row.id);
                if (seen.size <= 10) {
                    popularIds.add(row.id);
                }
            }
        }

        return { 
            stats,
            popularIds: Array.from(popularIds)
        };
    } catch (error: any) {
        console.error("[LOAD] Error loading stats:", error.message);
        return { stats: [], popularIds: [] };
    }
}
