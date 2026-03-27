import { json } from '@sveltejs/kit';
import { db } from '$lib/db/index.js';

export async function GET({ url }) {
    const setId = url.searchParams.get('set') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const search = url.searchParams.get('search') || '';
    const rarity = url.searchParams.get('rarity') || '';
    const type = url.searchParams.get('type') || '';
    const limit = 24;
    const offset = (page - 1) * limit;

    try {
        let where = `WHERE c.set_id = $1`;
        const params: any[] = [setId];
        let paramIdx = 2;

        if (search) {
            where += ` AND c.name ILIKE $${paramIdx}`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        if (rarity) {
            where += ` AND c.rarity = $${paramIdx}`;
            params.push(rarity);
            paramIdx++;
        }
        if (type) {
            where += ` AND c.types ILIKE $${paramIdx}`;
            params.push(`%${type}%`);
            paramIdx++;
        }

        const { rows: cards } = await db.query(
            `SELECT c.id, c.name, c."set", c.image, c.collector_number, c.rarity, c.supertype, c.types
             FROM cards c
             ${where}
             ORDER BY c.collector_number ASC, c.name ASC
             LIMIT ${limit + 1} OFFSET ${offset}`,
            params
        );

        const hasMore = cards.length > limit;
        if (hasMore) cards.pop();

        return json({ cards, hasMore });
    } catch (error: any) {
        console.error("[API] Error:", error.message);
        return json({ cards: [], hasMore: false }, { status: 500 });
    }
}
