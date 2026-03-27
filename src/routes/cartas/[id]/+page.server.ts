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

        // 2. Price history (last 30 days, per language and condition-agnostic using daily_stats)
        const { rows: history } = await db.query(
            `SELECT date, TO_CHAR(date, 'DD/MM') as label, language,
                    ROUND(avg_price::numeric, 2) as avg_price,
                    ROUND(min_price::numeric, 2) as min_price,
                    ROUND(max_price::numeric, 2) as max_price,
                    listing_count
             FROM daily_stats
             WHERE card_id = $1
             ORDER BY date ASC`,
            [cardId]
        );

        // 3. Current listings breakdown by condition
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

        // 4. Detailed individual listings (Top 10 cheapest/latest)
        const { rows: realListings } = await db.query(
            `SELECT condition, price, language, seller_name, 
                    TO_CHAR(collected_at, 'DD/MM HH24:MI') as time
             FROM listings_normalized
             WHERE card_id = $1
             ORDER BY collected_at DESC, price ASC
             LIMIT 15`,
            [cardId]
        );

        // 5. Unique languages available
        const languages = [...new Set(history.map((r: any) => r.language).filter(Boolean))];
        const conditionLanguages = [...new Set(listings.map((r: any) => r.language).filter(Boolean))];

        // 6. Calculate trend (%) based on history
        const trends: Record<string, any> = {};
        for (const lang of languages) {
            const langHistory = history.filter((h: any) => h.language === lang);
            if (langHistory.length >= 2) {
                const latest = parseFloat(langHistory[langHistory.length - 1].avg_price);
                const previous = parseFloat(langHistory[langHistory.length - 2].avg_price);
                if (previous > 0) {
                    const diff = ((latest - previous) / previous) * 100;
                    trends[lang] = {
                        percent: diff.toFixed(1),
                        direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat'
                    };
                }
            }
        }

        return { card, history, listings, realListings, languages, conditionLanguages, trends };
    } catch (err: any) {
        if (err.status === 404) throw err;
        console.error('[LOAD] card detail error:', err.message);
        throw error(500, 'Error loading card data');
    }
}
