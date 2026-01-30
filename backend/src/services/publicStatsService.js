const { pool } = require('../config/db');

class PublicStatsService {
    static async getPublicStats() {
        try {
            console.log('[PublicStatsService] Fetching statistics...');

            // 1. Get user counts by role
            const usersByRoleRes = await pool.query(`
                SELECT role, COUNT(*) as count 
                FROM users 
                GROUP BY role
            `);

            const userCounts = usersByRoleRes.rows.reduce((acc, row) => {
                acc[row.role] = parseInt(row.count) || 0;
                return acc;
            }, {});

            // 2. Get Device Stats
            const devicesRes = await pool.query('SELECT COUNT(*) FROM devices');
            const recycledRes = await pool.query("SELECT COUNT(*) FROM devices WHERE current_state = 'RECYCLED'");

            // 3. Get Refurbished Stats (Completed Refurbish Jobs)
            const refurbishedRes = await pool.query("SELECT COUNT(*) FROM refurbish_jobs WHERE job_status = 'COMPLETED'");

            const totalDevices = parseInt(devicesRes.rows[0].count) || 0;
            const recycledDevices = parseInt(recycledRes.rows[0].count) || 0;
            const refurbishedDevices = parseInt(refurbishedRes.rows[0].count) || 0;

            // Calculate waste diversion rate (Recycled + Refurbished / Total)
            // Or just keep it as Recycled/Total? Refurbished is also diverted from waste!
            const divertedCount = recycledDevices + refurbishedDevices;
            const wasteDiversionRate = totalDevices > 0
                ? Math.round((divertedCount / totalDevices) * 100)
                : 0;

            const result = {
                devicesRecycled: totalDevices, // Keeping key name for compatibility, maybe rename label in UI? Or is this Total registered?
                // The UI label says "Devices Recycled" but code sends totalDevices (COUNT * from devices). 
                // That's weird. "Devices Recycled" usually means actually recycled. 
                // But previously it was totalDevices. I will keep it as "Total Devices Registered" in logic but send as 'devicesRecycled' key if frontend expects it.
                // Actually, the previous code sent totalDevices as devicesRecycled.

                totalRegisteredDevices: totalDevices,
                actuallyRecycled: recycledDevices,

                activeCitizens: userCounts['CITIZEN'] || 0,
                activeRefurbishers: userCounts['REFURBISHER'] || 0,
                activeCollectors: userCounts['COLLECTOR'] || 0,
                activeRecyclers: userCounts['RECYCLER'] || 0,
                activeAgents: userCounts['REFURBISHER_AGENT'] || 0,

                devicesRefurbished: refurbishedDevices,
                wasteDiverted: wasteDiversionRate,
                recyclingCenters: userCounts['RECYCLER'] || 0
            };

            console.log('[PublicStatsService] Returning:', result);
            return result;
        } catch (err) {
            console.error('[PublicStatsService] Error:', err.message);
            console.error('[PublicStatsService] Error stack:', err.stack);
            // Return default values on error
            return {
                devicesRecycled: 0,
                activeCitizens: 0,
                wasteDiverted: 0,
                recyclingCenters: 0
            };
        }
    }
}

module.exports = PublicStatsService;
