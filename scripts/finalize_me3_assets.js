import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function finalizeMe3() {
    try {
        const logo = 'https://images.scrydex.com/pokemon/me3-logo/logo';
        const symbol = 'https://images.scrydex.com/pokemon/me3-logo/symbol';
        await pool.query("UPDATE sets SET logo = $1, symbol = $2 WHERE id = 'me3'", [logo, symbol]);
        console.log('[OK] Logo and Symbol updated to official URLS.');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
finalizeMe3();
