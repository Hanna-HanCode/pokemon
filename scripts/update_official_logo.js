import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateOfficialLogo() {
    try {
        const officialUrl = 'https://images.scrydex.com/pokemon/me3-logo/logo';
        await pool.query("UPDATE sets SET logo = $1 WHERE id = 'me3'", [officialUrl]);
        console.log('[OK] Logo updated to official Scrydex URL.');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
updateOfficialLogo();
