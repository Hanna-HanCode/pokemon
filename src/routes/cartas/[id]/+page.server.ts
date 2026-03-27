import { db } from '$lib/db/index.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
    const cardId = params.id;

    try {
        // 1. Card info + set info
        const { rows: cardRows } = await db.query(
            `SELECT c.*, s.logo as set_logo, s.series, s.release_date
             FROM cards c
             LEFT JOIN sets s ON s.id = c.set_id
             WHERE c.id = $1`,
            [cardId]
        );
        if (cardRows.length === 0) throw error(404, 'Card not found');
        const card = cardRows[0];

        // 2. Daily Price history (aggregated, last 30 days)
        const { rows: dailyHistory } = await db.query(
            `SELECT date, TO_CHAR(date, 'DD/MM') as label, language, condition, 
                    ROUND(avg_price::numeric, 2) as avg_price,
                    ROUND(min_price::numeric, 2) as min_price,
                    ROUND(max_price::numeric, 2) as max_price
             FROM daily_stats
             WHERE card_id = $1
             ORDER BY date ASC`,
            [cardId]
        );

        // 2b. Hourly Price history (granular, last ~50 readings)
        const { rows: hourlyHistory } = await db.query(
            `SELECT collected_at as date, TO_CHAR(collected_at, 'DD/MM HH24:MI') as label, language, condition,
                    ROUND(price, 2) as avg_price, -- Individual price as 'avg' for the point
                    ROUND(price, 2) as min_price,
                    ROUND(price, 2) as max_price
             FROM listings_normalized
             WHERE card_id = $1
             ORDER BY collected_at ASC
             LIMIT 100`,
            [cardId]
        );

        // 3. Current listings breakdown (Condition Summary)
        const { rows: listings } = await db.query(
            `SELECT condition, language,
                    ROUND(AVG(price)::numeric, 2) as avg_price,
                    ROUND(MIN(price)::numeric, 2) as min_price,
                    ROUND(MAX(price)::numeric, 2) as max_price,
                    COUNT(*)::int as count
             FROM listings_normalized
             WHERE card_id = $1
             GROUP BY condition, language
             ORDER BY language, condition`,
            [cardId]
        );

        // 4. Detailed individual listings (Latest 15)
        const { rows: realListings } = await db.query(
            `SELECT condition, price, language, seller_name, 
                    TO_CHAR(collected_at, 'DD/MM HH24:MI') as time
             FROM listings_normalized
             WHERE card_id = $1
             ORDER BY collected_at DESC, price ASC
             LIMIT 15`,
            [cardId]
        );

        // 5. Build unique language and condition sets from all data
        const languages = [...new Set([...dailyHistory, ...hourlyHistory, ...listings].map(r => r.language).filter(Boolean))];
        
        // 6. Calculate trends based on dailyHistory
        const trends: Record<string, any> = {};
        const langs = [...new Set(dailyHistory.map(h => h.language))];
        const conditions = [...new Set(dailyHistory.map(h => h.condition))];

        for (const lang of langs) {
            for (const cond of conditions) {
                const hists = dailyHistory.filter((h: any) => h.language === lang && h.condition === cond);
                if (hists.length >= 2) {
                    const latest = parseFloat(hists[hists.length - 1].avg_price);
                    const previous = parseFloat(hists[hists.length - 2].avg_price);
                    if (previous > 0) {
                        const diff = ((latest - previous) / previous) * 100;
                        trends[`${lang}_${cond}`] = {
                            percent: Math.abs(diff).toFixed(1),
                            direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
                        };
                    }
                }
            }
        }

        return { card, dailyHistory, hourlyHistory, listings, realListings, languages, trends };
    } catch (err: any) {
        if (err.status === 404) throw err;
        console.error('[LOAD] card detail error:', err.message);
        throw error(500, 'Error loading card data');
    }
}
