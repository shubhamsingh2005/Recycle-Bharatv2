const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'refurbish_jobs'");
        console.log('COLUMNS_START');
        res.rows.forEach(r => console.log(r.column_name));
        console.log('COLUMNS_END');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
