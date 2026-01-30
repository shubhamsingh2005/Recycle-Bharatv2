const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT device_id, repair_quote, buyback_quote, job_status FROM refurbish_jobs");
        console.log('ALL_JOBS_QUOTES:');
        res.rows.forEach(r => {
            console.log(`DeviceID: ${r.device_id}, Status: ${r.job_status}, Repair: ${r.repair_quote}, Buyback: ${r.buyback_quote}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
