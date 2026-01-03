import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { claimAndDistribute, performBuybackAndBurn } from './services/feeService.js';
import { initDatabase, updateStats, getStats, resetFlipTimer } from './services/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from the React app (dist)
// Assuming dist is in the root, one level up from server/
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Initialize Database (async - will fallback to in-memory if no DB)
initDatabase();

// Status Endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: 'online', mode: config.creatorPrivateKey ? 'LIVE' : 'SIMULATION' });
});

// Stats Endpoint
app.get('/api/stats', (req, res) => {
    res.json({
        ...getStats(),
        tokenMint: config.tokenMint
    });
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
            updateStats('distributed', distributionResult.distributed || 0, {
                result: 'holder',
                amount: distributionResult.distributed,
                wallet: distributionResult.winner,
                txHash: distributionResult.claimSignature || distributionResult.claimed
            });
        }

    } else {
        console.log('🔥 Burn Result - Initiating Buyback & Burn Sequence...');
        distributionResult = await performBuybackAndBurn(10); // 10% keep for dev

        if (distributionResult.success) {
            // Estimate SOL value burned (approx claimed amount minus kep)
            const solBurnedValue = (distributionResult.claimed || 0) * 0.9;
            updateStats('burned', solBurnedValue, {
                result: 'burn',
                amount: solBurnedValue,
                wallet: 'Buyback & Burn',
                txHash: distributionResult.buyTx || distributionResult.burnTx
            });
        }
    }

    // Reset the flip timer for all clients
    const nextFlipTime = resetFlipTimer();

    res.json({
        success: true,
        flipResult: result,
        nextFlipTime: nextFlipTime,

        // Holder Params
        amount: result === 'holder'
            ? (distributionResult ? distributionResult.distributed : 0)
            : (distributionResult ? (distributionResult.claimed * 0.9) : 0), // For burn, show SOL used (approx)

        claimSignature: distributionResult ? (distributionResult.claimSignature || distributionResult.claimed) : null,
        transferSignature: distributionResult ? distributionResult.transferSignature : null,
        winner: distributionResult ? distributionResult.winner : null,

        // Burn Params
        buyTx: distributionResult ? distributionResult.buyTx : null,
        burnTx: distributionResult ? distributionResult.burnTx : null,
        burnedAmount: distributionResult ? distributionResult.burnedAmount : 0, // Raw Token Amount

        // Common
        hops: distributionResult ? distributionResult.hops : []
    });
});

// All other requests return the index.html from dist
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(config.port, () => {
    console.log(`
    🚀 $COINFLIP Backend Running on port ${config.port}
    -------------------------------------------
    Mode: ${config.creatorPrivateKey ? 'LIVE ✅' : 'SIMULATION ⚠️'}
    Bubbles: 🛡️ Protected (2-Hop / 3-Hop)
    Stats: 💾 Persisting to server/data/stats.json
    RPC:  ${config.rpcUrl}
    `);
});
