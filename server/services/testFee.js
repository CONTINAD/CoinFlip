import { claimCreatorFees } from './feeService.js';
import { config } from '../config.js';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';

// Force console.log to be verbose
console.log("----------------------------------------------------------------");
console.log("🧪 Starting Manual Fee Claim Test");
console.log("----------------------------------------------------------------");
console.log(`Config Loaded:`);
console.log(`- RPC URL: ${config.rpcUrl ? 'Set' : 'Missing'}`);
console.log(`- Private Key: ${config.creatorPrivateKey ? 'Set (Hidden)' : 'Missing'}`);
console.log(`- Mint Address: ${config.tokenMint}`);
console.log("----------------------------------------------------------------");

async function runTest() {
    try {
        // Connect and check balance
        const connection = new Connection(config.rpcUrl, 'confirmed');
        const secretKey = bs58.decode(config.creatorPrivateKey);
        const wallet = Keypair.fromSecretKey(secretKey);

        const balance = await connection.getBalance(wallet.publicKey);
        const solBalance = balance / LAMPORTS_PER_SOL;

        console.log(`👛 Wallet: ${wallet.publicKey.toBase58()}`);
        console.log(`💰 Balance: ${solBalance.toFixed(6)} SOL`);

        if (solBalance < 0.002) {
            console.warn("⚠️ WARNING: Balance is very low! Transactions may fail (need gas).");
        }

        console.log("Attempting to claim fees...");
        const result = await claimCreatorFees();

        console.log("----------------------------------------------------------------");
        console.log("📊 Test Result:");
        console.log(JSON.stringify(result, null, 2));

        if (result.success) {
            console.log("✅ SUCCESS: Claim transaction executed (or simulated).");
        } else {
            console.log("❌ FAILURE: " + (result.error || "Unknown error"));
        }
    } catch (error) {
        console.error("💥 CRITICAL ERROR:", error);
    }
    console.log("----------------------------------------------------------------");
    process.exit(0);
}

runTest();
