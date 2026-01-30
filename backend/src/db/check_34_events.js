const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT * FROM lifecycle_events WHERE device_id = 34 ORDER BY timestamp DESC");
        console.log('--- EVENTS FOR 34 ---');
        res.rows.forEach(r => {
            console.log(`[${r.timestamp.toISOString()}] ${r.from_state} -> ${r.to_state} | Type: ${r.event_type}`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
