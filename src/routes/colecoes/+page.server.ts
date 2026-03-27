import { db } from '$lib/db/index.js';

export async function load() {
    try {
        const { rows: sets } = await db.query(`
            SELECT s.id, s.name, s.series, s.logo, s.symbol, s.release_date, s.total,
                   COUNT(c.id)::int as card_count
            FROM sets s
            LEFT JOIN cards c ON c.set_id = s.id
            GROUP BY s.id, s.name, s.series, s.logo, s.symbol, s.release_date, s.total
            ORDER BY s.release_date DESC
        `);

        // Group by series
        const seriesMap: Record<string, any[]> = {};
        for (const set of sets) {
            if (!seriesMap[set.series]) seriesMap[set.series] = [];
            seriesMap[set.series].push(set);
        }

        // Convert to ordered array (newest series first)
        const series = Object.entries(seriesMap).map(([name, sets]) => ({
            name,
            sets
        }));

        return { series };
    } catch (error: any) {
        console.error("[LOAD] Error loading sets:", error.message);
        return { series: [] };
    }
}
