import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let stats = {
    totalSolDistributed: 0,
    totalSolBurned: 0,
    totalFlips: 0
};

export function loadStats() {
    try {
        if (fs.existsSync(STATS_FILE)) {
            const data = fs.readFileSync(STATS_FILE, 'utf8');
            stats = JSON.parse(data);
            console.log('📊 Loaded stats:', stats);
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

export function updateStats(type, amount) {
    if (type === 'distributed') {
        stats.totalSolDistributed += amount;
    } else if (type === 'burned') {
        stats.totalSolBurned += amount;
    }
    stats.totalFlips += 1;
    saveStats();
    return stats;
}

export function getStats() {
    return stats;
}
