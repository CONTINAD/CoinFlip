import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use environment variable for data directory (for Railway Volume), or default to local
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let stats = {
    totalSolDistributed: 0,
    totalSolBurned: 0,
    totalFlips: 0,
    history: [] // New: Store recent history
};

export function loadStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = fs.readFileSync(STATS_FILE, 'utf8');
            const loaded = JSON.parse(data);
            // Merge defaults in case of new fields
            stats = { ...stats, ...loaded };
            if (!stats.history) stats.history = []; // Ensure history exists
            console.log('📊 Loaded stats:', { ...stats, history: `${stats.history.length} records` });
        } else {
            saveStats(); // Create initial file
        }
    } catch (err) {
        console.error('Failed to load stats:', err);
    }
    return stats;
}

export function saveStats() {
    try {
        fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    } catch (err) {
        console.error('Failed to save stats:', err);
    }
}

export function updateStats(type, amount, details = {}) {
    if (type === 'distributed') {
        stats.totalSolDistributed += amount;
    } else if (type === 'burned') {
        stats.totalSolBurned += amount;
    }
    stats.totalFlips += 1;

    // Add to history
    if (details && details.result) {
        const newRecord = {
            id: Date.now(),
            result: details.result,
            amount: amount,
            wallet: details.wallet,
            txHash: details.txHash,
            timestamp: new Date().toISOString()
        };
        stats.history.unshift(newRecord);

        // Keep only last 50 entries to prevent file bloating
        if (stats.history.length > 50) {
            stats.history = stats.history.slice(0, 50);
        }
    }

    saveStats();
    return stats;
}

export function getStats() {
    return stats;
}
