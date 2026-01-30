const { pool } = require('../config/db');
const LifecycleService = require('../services/lifecycle');
const crypto = require('crypto');

class RefurbishController {
    // 1. Citizen: Request Refurbishing (DIAGNOSTIC)
    // Handled in deviceController.js (similar to requestRecycling)

    // 2. Refurbisher: Get All Active Jobs (Diagnostic, Repair, etc)
    static async getPendingJobs(req, res) {
        try {
            let query;
            let params;

            if (req.user.role === 'REFURBISHER') {
                query = `SELECT rj.*, d.model, d.brand, d.device_type, d.current_state as device_state, d.current_duc, u.email as citizen_email, u.full_name as citizen_name
                         FROM refurbish_jobs rj
                         JOIN devices d ON rj.device_id = d.id
                         JOIN users u ON rj.citizen_id = u.id
                         WHERE rj.refurbisher_id = $1
                         ORDER BY rj.updated_at DESC`;
                params = [req.user.id];
            } else if (req.user.role === 'REFURBISHER_AGENT') {
                // Agents only see jobs explicitly assigned to them that are not yet in the center
                query = `SELECT rj.*, d.model, d.brand, d.device_type, d.current_state, u.email as citizen_email, u.full_name as citizen_name
                         FROM refurbish_jobs rj
                         JOIN devices d ON rj.device_id = d.id
                         JOIN users u ON rj.citizen_id = u.id
                         WHERE rj.agent_id = $1 AND (rj.job_status = 'ASSIGNED' OR rj.job_status = 'PICKED_UP')
                         ORDER BY rj.updated_at DESC`;
                params = [req.user.id];
            } else {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            const jobs = await pool.query(query, params);
            res.json(jobs.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // 3. Refurbisher: Accept Initial Request
    static async acceptJob(req, res) {
        const { deviceId } = req.body;
        try {
            await LifecycleService.transitionState(deviceId, 'REFURB_ACCEPTED', req.user);
            await pool.query(
                `UPDATE refurbish_jobs SET job_status = 'ACCEPTED', updated_at = NOW() WHERE device_id = $1`,
                [deviceId]
            );
            res.json({ message: 'Request accepted. Please assign an agent for pickup.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // 4. Refurbisher: Get List of Agents
    static async getAgents(req, res) {
        try {
            const agents = await pool.query(
                `SELECT id, full_name, email, phone FROM users WHERE role = 'REFURBISHER_AGENT' AND is_active = true`
            );
            res.json(agents.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // 4. Refurbisher: Assign Agent to Job
    static async assignAgent(req, res) {
        const { deviceId, agentId } = req.body;
        try {
            await LifecycleService.transitionState(deviceId, 'REFURB_AGENT_ASSIGNED', req.user);
            await pool.query(
                `UPDATE refurbish_jobs SET agent_id = $1, job_status = 'ASSIGNED', updated_at = NOW() WHERE device_id = $2`,
                [agentId, deviceId]
            );
            res.json({ message: 'Agent assigned to pickup successfully.' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // 4. Refurbisher Agent: Confirm Pickup from Citizen (REF-XXXXXX)
    static async verifyPickupCode(req, res) {
        const { deviceId, pickupCode } = req.body;
        const agentId = req.user.id;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const jobRes = await client.query(
                `SELECT * FROM refurbish_jobs WHERE device_id = $1 AND refurb_pickup_code = $2 AND agent_id = $3`,
                [deviceId, pickupCode, agentId]
            );

            if (jobRes.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid or incorrect pickup code.' });
            }

            // Update Lifecycle: Assigned -> Picked Up
            await LifecycleService.transitionState(deviceId, 'REFURB_PICKED_UP', req.user);

            // Update job
            await client.query(
                `UPDATE refurbish_jobs SET job_status = 'PICKED_UP', updated_at = NOW() WHERE device_id = $1`,
                [deviceId]
            );

            await client.query('COMMIT');
            res.json({ message: 'Device picked up from citizen. Please deliver to facility.' });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        } finally {
            client.release();
        }
    }

    // 5. Refurbisher: Confirm Arrival at Facility (Agent gives same code)
    static async verifyArrivalAtCenter(req, res) {
        const { deviceId, pickupCode } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const jobRes = await client.query(
                `SELECT * FROM refurbish_jobs WHERE device_id = $1 AND refurb_pickup_code = $2`,
                [deviceId, pickupCode]
            );

            if (jobRes.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid code or device mismatch.' });
            }

            // Update Lifecycle: Picked Up -> Under Diagnostic
            await LifecycleService.transitionState(deviceId, 'UNDER_DIAGNOSTIC', req.user);

            // Update job
            await client.query(
                `UPDATE refurbish_jobs SET job_status = 'DIAGNOSTIC', updated_at = NOW() WHERE device_id = $1`,
                [deviceId]
            );

            await client.query('COMMIT');
            res.json({ message: 'Device received at facility. Diagnostic started.' });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        } finally {
            client.release();
        }
    }

    // 4. Refurbisher: Submit Diagnostic Proposal
    static async submitProposal(req, res) {
        let { deviceId, repairQuote, buybackQuote, diagnosticReport } = req.body;
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const rQuote = (repairQuote === '' || repairQuote === null) ? null : parseFloat(repairQuote);
            const bQuote = (buybackQuote === '' || buybackQuote === null) ? null : parseFloat(buybackQuote);

            const updatedJob = await client.query(
                `UPDATE refurbish_jobs SET 
                 repair_quote = $1, 
                 buyback_quote = $2, 
                 diagnostic_report = $3,
                 job_status = 'PROPOSED',
                 updated_at = NOW()
                 WHERE device_id = $4 RETURNING *`,
                [rQuote, bQuote, diagnosticReport, deviceId]
            );

            if (updatedJob.rowCount === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'Refurbish job not found for this device.' });
            }

            await LifecycleService.transitionState(deviceId, 'PROPOSAL_PENDING', req.user, {}, client);

            await client.query('COMMIT');
            res.json({ message: 'Proposal submitted successfully', job: updatedJob.rows[0] });

        } catch (err) {
            await client.query('ROLLBACK');
            console.error('[SUBMIT_PROPOSAL_ERROR]', err);
            res.status(500).json({
                message: 'Failed to submit proposal: ' + err.message,
                code: err.code || 'UNKNOWN_ERROR'
            });
        } finally {
            client.release();
        }
    }

    // 5. Citizen: Accept Repair or Sell
    static async respondToProposal(req, res) {
        const { deviceId, decision } = req.body; // 'APPROVE_REPAIR' or 'SELL_COMPONENTS'

        try {
            const nextState = decision === 'APPROVE_REPAIR' ? 'REPAIRING' : 'COMPONENTS_SOLD';

            // Generate Return Code if Repairing
            let returnCode = null;
            if (decision === 'APPROVE_REPAIR') {
                returnCode = 'RTN-' + crypto.randomInt(100000, 999999).toString();
            }

            // Update Job
            await pool.query(
                `UPDATE refurbish_jobs SET 
                 citizen_decision = $1, 
                 refurb_return_code = $2,
                 updated_at = NOW()
                 WHERE device_id = $3`,
                [decision, returnCode, deviceId]
            );

            // Transition Lifecycle
            await LifecycleService.transitionState(deviceId, nextState, req.user);

            res.json({
                message: `Proposal ${decision === 'APPROVE_REPAIR' ? 'Accepted' : 'Sold'} successfully.`,
                returnCode
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        }
    }

    // 6. Refurbisher: Handover waste to Recycler (WASTE_HANDOVER_PENDING)
    static async requestWastePickup(req, res) {
        const { deviceId, recyclerId } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Transition Device State (Idempotent check)
            const deviceRes = await client.query('SELECT current_state FROM devices WHERE id = $1', [deviceId]);
            const currentState = deviceRes.rows[0]?.current_state;

            if (currentState !== 'WASTE_HANDOVER_PENDING') {
                await LifecycleService.transitionState(deviceId, 'WASTE_HANDOVER_PENDING', req.user, client);
            }

            // 2. Get Job Details to find original citizen
            const jobRes = await client.query('SELECT * FROM refurbish_jobs WHERE device_id = $1', [deviceId]);
            const job = jobRes.rows[0];

            if (!job) throw new Error('Refurbish job not found');

            // 3. Create or Get Recycling Request
            let requestId;
            const existingReq = await client.query('SELECT id FROM recycling_requests WHERE device_id = $1', [deviceId]);

            if (existingReq.rows.length > 0) {
                requestId = existingReq.rows[0].id;
            } else {
                // Use refurbisher's address or a default if not set
                const addressRes = await client.query('SELECT address FROM users WHERE id = $1', [req.user.id]);
                const pickupAddress = addressRes.rows[0]?.address || 'Refurbishment Center (Default Location)';

                const requestRes = await client.query(
                    `INSERT INTO recycling_requests (device_id, citizen_id, pickup_address, sender_type, status)
                     VALUES ($1, $2, $3, 'REFURBISHER', 'ASSIGNED')
                     RETURNING id`,
                    [deviceId, req.user.id, pickupAddress]
                );
                requestId = requestRes.rows[0].id;

                // Generate DUC for handover
                const duc = require('crypto').randomInt(100000, 999999).toString();
                await client.query('UPDATE devices SET current_duc = $1 WHERE id = $2', [duc, deviceId]);
            }

            // If reusing existing request, ensure DUC exists
            if (existingReq.rows.length > 0) {
                const currentDucRes = await client.query('SELECT current_duc FROM devices WHERE id = $1', [deviceId]);
                if (!currentDucRes.rows[0]?.current_duc) {
                    const duc = require('crypto').randomInt(100000, 999999).toString();
                    await client.query('UPDATE devices SET current_duc = $1 WHERE id = $2', [duc, deviceId]);
                }
            }

            // 4. Assign to Selected Recycler (Collector) - Upsert
            if (recyclerId) {
                const existingAssignment = await client.query('SELECT id FROM collector_assignments WHERE request_id = $1', [requestId]);

                if (existingAssignment.rows.length > 0) {
                    await client.query(
                        `UPDATE collector_assignments 
                         SET collector_id = $1, assigned_at = NOW(), notes = 'Reassigned by Refurbisher'
                         WHERE request_id = $2`,
                        [recyclerId, requestId]
                    );
                } else {
                    await client.query(
                        `INSERT INTO collector_assignments (request_id, collector_id, status, notes)
                         VALUES ($1, $2, 'ASSIGNED', 'Direct assignment from Refurbisher for waste pickup')`,
                        [requestId, recyclerId]
                    );
                }
            }

            await client.query('COMMIT');

            res.json({ message: 'Waste pickup requested and assigned to recycler.' });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('requestWastePickup Error:', err);
            res.status(500).json({ message: 'Server error', error: err.message });
        } finally {
            client.release();
        }
    }

    // 7. Citizen: Verify Return (RTN-XXXXXX)
    static async verifyReturnCode(req, res) {
        const { deviceId, returnCode } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const jobRes = await client.query(
                `SELECT * FROM refurbish_jobs WHERE device_id = $1 AND refurb_return_code = $2`,
                [deviceId, returnCode]
            );

            if (jobRes.rows.length === 0) {
                return res.status(400).json({ message: 'Invalid or incorrect return code.' });
            }

            // Transition Lifecycle (REPAIRING -> ACTIVE)
            await LifecycleService.transitionState(deviceId, 'ACTIVE', req.user);

            // Mark device as refurbished
            await client.query('UPDATE devices SET is_refurbished = true WHERE id = $1', [deviceId]);

            // Mark job as completed
            await client.query(
                `UPDATE refurbish_jobs SET job_status = 'COMPLETED', updated_at = NOW() WHERE device_id = $1`,
                [deviceId]
            );

            await client.query('COMMIT');
            res.json({ message: 'Device repair verified. It is now active in your inventory.' });
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({ message: 'Server error', error: err.message });
        } finally {
            client.release();
        }
    }
}

module.exports = RefurbishController;
