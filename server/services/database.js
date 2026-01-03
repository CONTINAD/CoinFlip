import pg from 'pg';

const { Pool } = pg;

// Use Railway's DATABASE_URL or fall back to local
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// Flip interval in seconds
const FLIP_INTERVAL = 120;

// In-memory cache (synced from DB)
let statsCache = {
    totalSolDistributed: 0,
    totalSolBurned: 0,
    totalFlips: 0,
    history: [],
    nextFlipTime: null
};

/**
 * Initialize database tables
 */
export async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS app_stats (
                id INTEGER PRIMARY KEY DEFAULT 1,
                total_sol_distributed DECIMAL DEFAULT 0,
                total_sol_burned DECIMAL DEFAULT 0,
                total_flips INTEGER DEFAULT 0,
                next_flip_time TIMESTAMPTZ
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS flip_history (
                id SERIAL PRIMARY KEY,
                result VARCHAR(20) NOT NULL,
                amount DECIMAL DEFAULT 0,
                wallet VARCHAR(64),
                tx_hash VARCHAR(128),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Ensure we have a stats row
        await pool.query(`
            INSERT INTO app_stats (id, total_sol_distributed, total_sol_burned, total_flips)
            VALUES (1, 0, 0, 0)
            ON CONFLICT (id) DO NOTHING;
        `);

        console.log('📊 Database initialized');
        await loadStats();
        return true;
    } catch (error) {
        console.error('❌ Database init failed:', error.message);
        console.log('   Falling back to in-memory storage');
        return false;
    }
}

/**
 * Load stats from database
 */
export async function loadStats() {
    try {
        // Load main stats
        const statsResult = await pool.query('SELECT * FROM app_stats WHERE id = 1');
        if (statsResult.rows.length > 0) {
            const row = statsResult.rows[0];
            statsCache.totalSolDistributed = parseFloat(row.total_sol_distributed) || 0;
            statsCache.totalSolBurned = parseFloat(row.total_sol_burned) || 0;
            statsCache.totalFlips = row.total_flips || 0;
            statsCache.nextFlipTime = row.next_flip_time;
        }

        // Load history (last 50)
        const historyResult = await pool.query(
            'SELECT * FROM flip_history ORDER BY created_at DESC LIMIT 50'
        );
        statsCache.history = historyResult.rows.map(row => ({
            id: row.id,
            result: row.result,
            amount: parseFloat(row.amount) || 0,
            wallet: row.wallet,
            txHash: row.tx_hash,
            timestamp: row.created_at
        }));

        console.log('📊 Loaded stats from DB:', {
            distributed: statsCache.totalSolDistributed,
            burned: statsCache.totalSolBurned,
            flips: statsCache.totalFlips,
            history: `${statsCache.history.length} records`
        });

        return statsCache;
    } catch (error) {
        console.error('Failed to load stats:', error.message);
        return statsCache;
    }
}

/**
 * Update stats after a flip
 */
export async function updateStats(type, amount, details = {}) {
    try {
        // Update totals
        if (type === 'distributed') {
            statsCache.totalSolDistributed += amount;
            await pool.query(
                'UPDATE app_stats SET total_sol_distributed = total_sol_distributed + $1, total_flips = total_flips + 1 WHERE id = 1',
                [amount]
            );
        } else if (type === 'burned') {
            statsCache.totalSolBurned += amount;
            await pool.query(
                'UPDATE app_stats SET total_sol_burned = total_sol_burned + $1, total_flips = total_flips + 1 WHERE id = 1',
                [amount]
            );
        }
        statsCache.totalFlips += 1;

        // Add to history
        if (details && details.result) {
            await pool.query(
                'INSERT INTO flip_history (result, amount, wallet, tx_hash) VALUES ($1, $2, $3, $4)',
                [details.result, amount, details.wallet, details.txHash]
            );

            // Reload history to get the new record with ID
            const historyResult = await pool.query(
                'SELECT * FROM flip_history ORDER BY created_at DESC LIMIT 50'
            );
            statsCache.history = historyResult.rows.map(row => ({
                id: row.id,
                result: row.result,
                amount: parseFloat(row.amount) || 0,
                wallet: row.wallet,
                txHash: row.tx_hash,
                timestamp: row.created_at
            }));
        }

        return statsCache;
    } catch (error) {
        console.error('Failed to update stats:', error.message);
        return statsCache;
    }
}

/**
 * Get current stats
 */
export function getStats() {
    // If nextFlipTime is in the past or not set, schedule a new one
    if (!statsCache.nextFlipTime || new Date(statsCache.nextFlipTime) < new Date()) {
        resetFlipTimer();
    }
    return statsCache;
}

/**
 * Reset the flip timer
 */
export async function resetFlipTimer() {
    const nextTime = new Date(Date.now() + FLIP_INTERVAL * 1000).toISOString();
    statsCache.nextFlipTime = nextTime;

    try {
        await pool.query('UPDATE app_stats SET next_flip_time = $1 WHERE id = 1', [nextTime]);
    } catch (error) {
        console.error('Failed to save next flip time:', error.message);
    }

    return nextTime;
}

export default pool;
