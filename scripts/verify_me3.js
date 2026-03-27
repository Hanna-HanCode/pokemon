import pkg from 'pg';
import 'dotenv/config';
const { Pool } = pkg;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function verify() {
    try {
        const { rows } = await pool.query("SELECT count(*) FROM cards WHERE set_id = 'me3'");
        console.log(`Cards for me3: ${rows[0].count}`);
        
        const { rows: setRows } = await pool.query("SELECT * FROM sets WHERE id = 'me3'");
        console.log(`Set me3: ${JSON.stringify(setRows[0])}`);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
verify();
