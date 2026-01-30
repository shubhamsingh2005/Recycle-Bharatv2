const { pool } = require('../config/db');
const PublicStatsService = require('../services/publicStatsService');

class PublicStatsController {
    // GET /api/public/stats - No authentication required
    static async getPublicStats(req, res) {
        try {
            const stats = await PublicStatsService.getPublicStats();
            res.json(stats);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // GET /api/public/refurbishers
    static async getRefurbishers(req, res) {
        try {
            const refurbishers = await pool.query(
                "SELECT id, full_name FROM users WHERE role = 'REFURBISHER' ORDER BY full_name ASC"
            );
            res.json(refurbishers.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // GET /api/public/recyclers
    static async getRecyclers(req, res) {
        try {
            const recyclers = await pool.query(
                "SELECT id, full_name, address FROM users WHERE role = 'RECYCLER' ORDER BY full_name ASC"
            );
            res.json(recyclers.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
}

module.exports = PublicStatsController;
