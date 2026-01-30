const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query(`
            SELECT d.id, d.model, d.current_state, rj.job_status 
            FROM devices d 
            JOIN users u ON d.owner_id = u.id 
            LEFT JOIN refurbish_jobs rj ON d.id = rj.device_id
            WHERE u.email = 'abhinabjana@gmail.com'
        `);
        console.log('ABHINAB_DEVICES:');
        res.rows.forEach(r => console.log(`ID: ${r.id}, State: ${r.current_state}, Job: ${r.job_status}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
