import { db } from '../db/index.js';

export async function generateDailyStats(date: string) {
    const res = await db.query(`
        SELECT DISTINCT card_id, language
        FROM listings_normalized 
        WHERE DATE(collected_at) = $1
    `, [date]);

    for (const row of res.rows) {
        const { card_id, language } = row;
        const statsRes = await db.query(`
            SELECT 
                MIN(price) as min_price,
                AVG(price) as avg_price,
                MAX(price) as max_price,
                COUNT(*) as listing_count
            FROM listings_normalized
            WHERE card_id = $1 AND language = $2 AND DATE(collected_at) = $3
        `, [card_id, language, date]);

        if (statsRes.rows.length > 0) {
            const stats = statsRes.rows[0];
            
            await db.query(`
                INSERT INTO daily_stats (date, card_id, language, avg_price, min_price, max_price, listing_count)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (date, card_id, language) DO UPDATE SET
                    avg_price = EXCLUDED.avg_price,
                    min_price = EXCLUDED.min_price,
                    max_price = EXCLUDED.max_price,
                    listing_count = EXCLUDED.listing_count
            `, [
                date,
                card_id, 
                language,
                stats.avg_price, 
                stats.min_price, 
                stats.max_price, 
                stats.listing_count
            ]);
        }
    }
}

export async function runStatsAggregator() {
    const today = new Date().toISOString().split('T')[0];
    console.log(`Running Daily Stats Aggregator for ${today}...`);
    await generateDailyStats(today);
}
