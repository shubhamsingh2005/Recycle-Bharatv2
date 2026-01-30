const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('🔄 Reassigning orphan jobs to active refurbisher...');
        // Find the ID of refurbisher@gmail.com
        const refurbRes = await pool.query("SELECT id FROM users WHERE email = 'refurbisher@gmail.com'");
        if (refurbRes.rows.length > 0) {
            const activeId = refurbRes.rows[0].id;
            const res = await pool.query("UPDATE refurbish_jobs SET refurbisher_id = $1 WHERE refurbisher_id != $1", [activeId]);
            console.log(`✅ Updated ${res.rowCount} jobs to refurbisher ID ${activeId}`);
        } else {
            console.log('❌ Could not find active refurbisher.');
        }
    } catch (err) {
        console.error('❌ Failed:', err);
    } finally {
        await pool.end();
    }
};

run();
