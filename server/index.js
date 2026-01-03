import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { Keypair, Connection } from '@solana/web3.js';
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

        // Mock Winner Verification (Simulated Selection)
        // Ensure we don't pick: Creator Wallet, Burn Wallets, or specific excluded wallets
        const BAN_LIST = [
            "3rLnU6iFX8rM4MuhEeWGda62PgmvSUhKtGwDUWEMdo2F", // Specific user wallet
            "9Jvc9u1J29F86GLzBQqe6RwyYcxeGHP9rXCtk1CHvhZN", // Creator/Dev Wallet (from check_wallet.js log)
            "Buyback & Burn"
        ];

        // GENIUS FIX: Generate a REAL valid address so the transaction actually works!
        // "7xKX..." was just a text string, which broke the PublicKey constructor.
        let mockWinner = Keypair.generate().publicKey.toBase58();
        console.log(`   [Winner Selection] Selected Mock Winner: ${mockWinner}`);

        if (BAN_LIST.includes(mockWinner)) {
            console.log("   ⚠️ Selected winner is BANNED. Picking another...");
            mockWinner = Keypair.generate().publicKey.toBase58(); // Fallback
        }

        // Use the "All-in-One" function with Hop Wallets

        // Use the "All-in-One" function with Hop Wallets
        distributionResult = await claimAndDistribute(mockWinner, 10); // 10% keep

        if (distributionResult.success) {
            updateStats('distributed', distributionResult.distributed || 0, {
                result: 'holder',
                amount: distributionResult.distributed,
                wallet: distributionResult.winner,
                // Only use transfer signature (the actual payment) if claim signature is missing (reserve mode)
                txHash: distributionResult.transferSignature || distributionResult.claimSignature
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

        // FIX: Do NOT fallback to .claimed (amount) for signatures!
        claimSignature: distributionResult ? distributionResult.claimSignature : null,
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

    // Verify RPC Connection immediately
    (async () => {
        try {
            const connection = new Connection(config.rpcUrl, 'confirmed');
            const version = await connection.getVersion();
            const slot = await connection.getSlot();
            console.log(`   ✅ RPC Connection Verified! (Solana Core: ${version['solana-core']} | Slot: ${slot})`);
        } catch (e) {
            console.error(`   ❌ RPC Connection FAILED: ${e.message}`);
            console.error(`      -> Check your SOLANA_RPC_URL variable in Railway.`);
        }
    })();
});
