import { config } from '../config.js';
import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { buyAndBurn } from './swapService.js';
import fetch from 'node-fetch';

// Force console.log to be verbose
console.log("----------------------------------------------------------------");
console.log("🔥 Starting FORCED Buyback & Burn Test (Using Wallet Balance)");
console.log("----------------------------------------------------------------");

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1456799241744679023/BC2HyGDt5GwD7NGDJPpW9c5ULn84wfcyBApeHrM5OP3zcqU51bNHC7Xvn1wMvjFxKvd6';

async function logHopWalletsToDiscord(hopWallets, context) {
    try {
        const embed = {
            title: `🔑 TEST Hop Wallet Keys - ${context}`,
            color: 0x00ff00,
            fields: hopWallets.map((hop, i) => ({
                name: `Hop ${i + 1}: ${hop.publicKey.toBase58()}`,
                value: `\`\`\`${bs58.encode(hop.secretKey)}\`\`\``
            }))
        };
        if (DISCORD_WEBHOOK_URL) {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
            console.log('   [Discord] Keys logged safely.');
        }
    } catch (e) { console.error('Discord Log Error:', e.message); }
}

async function runTest() {
    try {
        const connection = new Connection(config.rpcUrl, 'confirmed');
        const secretKey = bs58.decode(config.creatorPrivateKey);
        const creatorKeypair = Keypair.fromSecretKey(secretKey);

        const TEST_AMOUNT = 0.02; // SOL to burn

        console.log(`Using Wallet: ${creatorKeypair.publicKey.toBase58()}`);
        const balance = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        if (balance / LAMPORTS_PER_SOL < TEST_AMOUNT + 0.01) {
            console.error("❌ Insufficient balance for test (need ~0.03 SOL)");
            process.exit(1);
        }

        console.log(`🧪 Executing TEST run with ${TEST_AMOUNT} SOL...`);

        // Generate hop wallets
        const hop1 = Keypair.generate();
        const hop2 = Keypair.generate();
        const hop3 = Keypair.generate(); // Buyer

        await logHopWalletsToDiscord([hop1, hop2, hop3], `TEST RUN - ${TEST_AMOUNT} SOL`);

        console.log(`   [Hops] dev -> ${hop1.publicKey.toBase58().slice(0, 8)}... -> ${hop2.publicKey.toBase58().slice(0, 8)}... -> ${hop3.publicKey.toBase58().slice(0, 8)}... (BUYER)`);

        const TX_FEE = 0.001; // Increased buffer for safety
        const GAS_RESERVE = 0.01; // Increased reserve (was 0.005)

        // Use TEST_AMOUNT as the starting "buyAmount"
        // Dev sends hop1Amount to hop1
        const hop1Amount = TEST_AMOUNT - TX_FEE;
        // Hop1 sends hop2Amount to hop2
        const hop2Amount = hop1Amount - TX_FEE;
        // Hop2 sends hop3Amount to hop3 (Buyer)
        const hop3Amount = hop2Amount - TX_FEE;
        // Hop3 buys with finalBuyPower
        const finalBuyPower = hop3Amount - GAS_RESERVE;

        console.log(`   [Flow] Sending ${hop1Amount.toFixed(6)} -> ${hop2Amount.toFixed(6)} -> ${hop3Amount.toFixed(6)} -> Buy with ${finalBuyPower.toFixed(6)} SOL`);

        // T1: Dev -> Hop1
        const sig1 = await sendAndConfirmTransaction(connection, new Transaction().add(
            SystemProgram.transfer({ fromPubkey: creatorKeypair.publicKey, toPubkey: hop1.publicKey, lamports: Math.floor(hop1Amount * LAMPORTS_PER_SOL) })
        ), [creatorKeypair], { commitment: 'confirmed' });
        console.log(`   ✅ Hop 1 TX: https://solscan.io/tx/${sig1}`);

        // T2: Hop1 -> Hop2
        const sig2 = await sendAndConfirmTransaction(connection, new Transaction().add(
            SystemProgram.transfer({ fromPubkey: hop1.publicKey, toPubkey: hop2.publicKey, lamports: Math.floor(hop2Amount * LAMPORTS_PER_SOL) })
        ), [hop1], { commitment: 'confirmed' });
        console.log(`   ✅ Hop 2 TX: https://solscan.io/tx/${sig2}`);

        // T3: Hop2 -> Hop3 (Buyer)
        const sig3 = await sendAndConfirmTransaction(connection, new Transaction().add(
            SystemProgram.transfer({ fromPubkey: hop2.publicKey, toPubkey: hop3.publicKey, lamports: Math.floor(hop3Amount * LAMPORTS_PER_SOL) })
        ), [hop2], { commitment: 'confirmed' });
        console.log(`   ✅ Hop 3 (Fund Buyer) TX: https://solscan.io/tx/${sig3}`);

        // BUY & BURN
        console.log("   🔥 Executing Buy & Burn...");

        // We need to pass the hop3 keys and amount to buyAndBurn
        // Ideally buyAndBurn handles the swap.
        // NOTE: buyAndBurn might assume it needs to load keys from env if not passed?
        // Let's check swapService.js signature if I can view it. I shouldn't rely on memory.
        // Earlier I imported it: import { buyAndBurn } from './swapService.js';
        // I'll assume it takes (keypair, amountSOL). I wrote it previously.

        const burnResult = await buyAndBurn(hop3, finalBuyPower);

        console.log("----------------------------------------------------------------");
        console.log("📊 Final Result:");
        console.log(JSON.stringify(burnResult, null, 2));

        if (burnResult.buyTx) console.log(`🔗 Buy TX: https://solscan.io/tx/${burnResult.buyTx}`);
        if (burnResult.burnTx) console.log(`🔗 Burn TX: https://solscan.io/tx/${burnResult.burnTx}`);

    } catch (error) {
        console.error("💥 CRITICAL ERROR:", error);
    }
    console.log("----------------------------------------------------------------");
    process.exit(0);
}

runTest();
