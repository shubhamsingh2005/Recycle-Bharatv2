const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const run = async () => {
    try {
        console.log('🔄 Repairing desynced jobs...');

        // Find jobs where job_status is PROPOSED but device state is not PROPOSAL_PENDING
        const res = await pool.query(`
            SELECT rj.device_id, d.model, d.current_state, rj.job_status
            FROM refurbish_jobs rj
            JOIN devices d ON rj.device_id = d.id
            WHERE rj.job_status = 'PROPOSED' AND d.current_state != 'PROPOSAL_PENDING'
        `);

        for (const row of res.rows) {
            console.log(`Fixing DeviceID: ${row.device_id} (${row.model}). Resetting to DIAGNOSTIC for proper re-submission.`);

            await pool.query('BEGIN');

            // Move device state to UNDER_DIAGNOSTIC (so it's ready for PROPOSAL_PENDING)
            await pool.query('UPDATE devices SET current_state = $1 WHERE id = $2', ['UNDER_DIAGNOSTIC', row.device_id]);

            // Reset job status to DIAGNOSTIC
            await pool.query('UPDATE refurbish_jobs SET job_status = $1 WHERE device_id = $2', ['DIAGNOSTIC', row.device_id]);

            await pool.query('COMMIT');
        }

        console.log('✅ Repair completed.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await pool.end();
    }
};

run();
