import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { claimAndDistribute, performBuybackAndBurn } from './services/feeService.js';
import { loadStats, updateStats, getStats } from './services/statsService.js';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Stats
loadStats();

// Status Endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', mode: config.creatorPrivateKey ? 'LIVE' : 'SIMULATION' });
});

// Stats Endpoint
app.get('/api/stats', (req, res) => {
    res.json(getStats());
});

// Main Game Endpoint: Claim Flip
app.post('/api/claim-flip', async (req, res) => {
    console.log('🎲 New Flip Request received');

    // 1. Determine Result logic first (Simulated logic for game)
    const isHeads = Math.random() < 0.5;
    const result = isHeads ? 'burn' : 'holder';

    let distributionResult = null;

    if (result === 'holder') {
        console.log("🎁 Winner! Attempting claim & distribute cycle...");
        const mockWinner = "7xKXp3mN9vWq...BvR2"; // Placeholder until we have real holder list

        // Use the "All-in-One" function with Hop Wallets
        distributionResult = await claimAndDistribute(mockWinner, 10); // 10% keep

        if (distributionResult.success) {
            updateStats('distributed', distributionResult.distributed || 0);
        }

    } else {
        console.log('🔥 Burn Result - Initiating Buyback & Burn Sequence...');
        distributionResult = await performBuybackAndBurn(10); // 10% keep for dev

        if (distributionResult.success) {
            // Estimate SOL value burned (approx claimed amount minus kep)
            const solBurnedValue = (distributionResult.claimed || 0) * 0.9;
            updateStats('burned', solBurnedValue);
        }
    }

    res.json({
        success: true,
        flipResult: result,

        // Holder Params
        amount: distributionResult ? distributionResult.distributed : 0,
        claimSignature: distributionResult ? (distributionResult.claimSignature || distributionResult.claimed) : null,
        transferSignature: distributionResult ? distributionResult.transferSignature : null,
        winner: distributionResult ? distributionResult.winner : null,

        // Burn Params
        buyTx: distributionResult ? distributionResult.buyTx : null,
        burnTx: distributionResult ? distributionResult.burnTx : null,
        burnedAmount: distributionResult ? distributionResult.burnedAmount : 0,

        // Common
        hops: distributionResult ? distributionResult.hops : []
    });
});

app.listen(config.port, () => {
    console.log(`
    🚀 Coinflip Backend Running on port ${config.port}
    -------------------------------------------
    Mode: ${config.creatorPrivateKey ? 'LIVE ✅' : 'SIMULATION ⚠️'}
    Bubbles: 🛡️ Protected (2-Hop / 3-Hop)
    Stats: 💾 Persisting to server/data/stats.json
    RPC:  ${config.rpcUrl}
    `);
});
