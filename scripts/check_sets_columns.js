import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkColumns() {
    try {
        const { rows } = await pool.query("SELECT * FROM sets WHERE id = 'me3'");
        console.log(Object.keys(rows[0]));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkColumns();
