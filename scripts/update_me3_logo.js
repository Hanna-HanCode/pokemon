import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function updateLogo() {
    try {
        await pool.query("UPDATE sets SET logo = $1 WHERE id = 'me3'", ['/logos/me3_logo.png']);
        console.log('[OK] Logo updated for set me3.');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
updateLogo();
