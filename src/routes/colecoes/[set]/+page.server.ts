import { db } from '$lib/db/index.js';

export async function load({ params, url }) {
    const setId = params.set;
    const page = 1;
    const limit = 24;
    const search = url.searchParams.get('search') || '';
    const rarity = url.searchParams.get('rarity') || '';
    const type = url.searchParams.get('type') || '';

    try {
        // Get set info
        const { rows: setRows } = await db.query(
            `SELECT * FROM sets WHERE id = $1`, [setId]
        );
        const setInfo = setRows[0] || { name: setId, series: '' };

        // Build dynamic WHERE
        let where = `WHERE c.set_id = $1`;
        const params_arr: any[] = [setId];
        let paramIdx = 2;

        if (search) {
            where += ` AND c.name ILIKE $${paramIdx}`;
            params_arr.push(`%${search}%`);
            paramIdx++;
        }
        if (rarity) {
            where += ` AND c.rarity = $${paramIdx}`;
            params_arr.push(rarity);
            paramIdx++;
        }
        if (type) {
            where += ` AND c.types ILIKE $${paramIdx}`;
            params_arr.push(`%${type}%`);
            paramIdx++;
        }

        // Get cards
        const { rows: cards } = await db.query(
            `SELECT c.id, c.name, c."set", c.image, c.collector_number, c.rarity, c.supertype, c.types
             FROM cards c
             ${where}
             ORDER BY c.collector_number ASC, c.name ASC
             LIMIT ${limit + 1}`,
            params_arr
        );

        const hasMore = cards.length > limit;
        if (hasMore) cards.pop();

        // Get available rarities for this set
        const { rows: rarities } = await db.query(
            `SELECT rarity, COUNT(*)::int as cnt FROM cards WHERE set_id = $1 AND rarity IS NOT NULL GROUP BY rarity ORDER BY cnt DESC`,
            [setId]
        );

        // Get available types for this set
        const { rows: types } = await db.query(
            `SELECT DISTINCT unnest(string_to_array(types, ',')) as type FROM cards WHERE set_id = $1 AND types IS NOT NULL ORDER BY type`,
            [setId]
        );

        return {
            setInfo,
            cards,
            hasMore,
            rarities,
            types: types.map((t: any) => t.type),
            filters: { search, rarity, type },
            page
        };
    } catch (error: any) {
        console.error("[LOAD] Error:", error.message);
        return { setInfo: { name: setId }, cards: [], hasMore: false, rarities: [], types: [], filters: {}, page: 1 };
    }
}
