const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 Starting Circular Economy (Refurbisher) Migration...');
        await client.query('BEGIN');

        // 1. Add new roles to role_type enum
        // Note: In Postgres, adding values to enums inside a transaction is tricky. 
        // We will do it outside of the transaction block if it fails, or use this workaround.
        // But for safety on Render/Production, we'll try to add them if they don't exist.

        const roles = ['REFURBISHER', 'REFURBISHER_AGENT'];
        for (const role of roles) {
            try {
                await client.query(`ALTER TYPE role_type ADD VALUE IF NOT EXISTS '${role}'`);
                console.log(`✅ Role added: ${role}`);
            } catch (e) {
                // Ignore duplicate value error
            }
        }

        // 2. Add new states to device_state enum
        const states = [
            'REFURB_DIAGNOSTIC_REQUESTED',
            'UNDER_DIAGNOSTIC',
            'PROPOSAL_PENDING',
            'REPAIRING',
            'REFURBISHED',
            'COMPONENTS_SOLD',
            'WASTE_HANDOVER_PENDING'
        ];
        for (const state of states) {
            try {
                await client.query(`ALTER TYPE device_state ADD VALUE IF NOT EXISTS '${state}'`);
                console.log(`✅ State added: ${state}`);
            } catch (e) {
                // Ignore
            }
        }

        // 3. Update recycling_requests table to add origin_type
        // Wait, schema already has origins for devices, but let's add a sender_type for requests
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE recycling_requests ADD COLUMN IF NOT EXISTS sender_type VARCHAR(50) DEFAULT 'CITIZEN';
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);

        // 4. Create refurbish_jobs table
        await client.query(`
            CREATE TABLE IF NOT EXISTS refurbish_jobs (
                id SERIAL PRIMARY KEY,
                device_id INTEGER REFERENCES devices(id) UNIQUE NOT NULL,
                refurbisher_id INTEGER REFERENCES users(id) NOT NULL,
                agent_id INTEGER REFERENCES users(id),
                citizen_id INTEGER REFERENCES users(id) NOT NULL,
                
                -- Financials (Simulated)
                diagnostic_fee_paid BOOLEAN DEFAULT false,
                repair_quote DECIMAL(10, 2),
                buyback_quote DECIMAL(10, 2),
                
                -- Status
                citizen_decision VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVE_REPAIR, SELL_COMPONENTS, RETURN_AS_IS
                job_status VARCHAR(50) DEFAULT 'DIAGNOSTIC', -- DIAGNOSTIC, PROPOSED, IN_REPAIR, COMPLETED, CANCELLED
                diag_proposal_deadline TIMESTAMP WITH TIME ZONE,
                
                -- Verification Codes
                refurb_pickup_code VARCHAR(10),
                refurb_return_code VARCHAR(10),
                hardware_fingerprint JSONB,
                
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ refurbish_jobs table created.');

        // 5. Add current_duc to devices if not exists (for generic code storage)
        await client.query(`
            DO $$ BEGIN
                ALTER TABLE devices ADD COLUMN IF NOT EXISTS current_duc VARCHAR(20);
            EXCEPTION
                WHEN duplicate_column THEN null;
            END $$;
        `);

        await client.query('COMMIT');
        console.log('🏁 Migration Completed Successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration Failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
};

migrate();
