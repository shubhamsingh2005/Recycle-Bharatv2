const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        const res = await pool.query("SELECT id, model, current_state FROM devices WHERE model = '1'");
        console.log('DEVICES_WITH_MODEL_1:');
        res.rows.forEach(r => console.log(`ID: ${r.id}, State: ${r.current_state}`));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
