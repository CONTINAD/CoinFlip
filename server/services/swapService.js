import { config } from '../config.js';
import { Connection, Keypair, PublicKey, VersionedTransaction, Transaction, sendAndConfirmTransaction, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createBurnInstruction, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import fetch from 'node-fetch';
import bs58 from 'bs58';

/*
 * Swap & Burn Service
 * Handles the "Buyback & Burn" flow using Bonk.fun
 */

let connection = null;

try {
    if (config.rpcUrl) {
        connection = new Connection(config.rpcUrl, 'confirmed');
    }
} catch (e) {
    console.error("Initialization error:", e.message);
}

/**
 * Executes a Buyback and Burn operation
 * @param {string} hotWalletSecretKey - Secret key of the wallet doing the buy (Hot3)
 * @param {number} amountSol - Amount of SOL to spend on buyback
 */
export async function buyAndBurn(hotWalletKeypair, amountSol) {
    console.log(`🔥 Initiating Buyback & Burn with ${amountSol.toFixed(4)} SOL...`);

    if (!config.tokenMint) {
        return { success: false, error: 'Token Mint not configured' };
    }

    try {
        const payer = hotWalletKeypair;
        const mint = new PublicKey(config.tokenMint);

        // 1. BUY TOKENS via PumpPortal
        console.log(`   [Buy] Purchasing on Pump.fun...`);

        let buySignature = null;
        let boughtAmount = 0; // We need to fetch this or estimate it

        // PumpPortal Trade API for Bonk.fun
        // "action": "buy"
        const response = await fetch('https://pumpportal.fun/api/trade-local', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicKey: payer.publicKey.toBase58(),
                action: 'buy',
                mint: config.tokenMint,
                amount: amountSol, // SOL amount to spend
                denominatedInSol: 'true',
                slippage: 10, // High slippage for guaranteed execution
                priorityFee: 0.0001,
                pool: 'pump' // Target Pump.fun pool
            })
        });

        if (response.status === 200) {
            const data = await response.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));
            tx.sign([payer]);

            buySignature = await connection.sendTransaction(tx, {
                skipPreflight: false,
                preflightCommitment: 'confirmed'
            });

            console.log(`   [Buy] TX Sent: ${buySignature}`);
            await connection.confirmTransaction(buySignature, 'confirmed');
            console.log(`   [Buy] Confirmed!`);
        } else {
            const errText = await response.text();
            console.error(`   [Buy] Failed: ${errText}`);
            // If buy fails, we can't burn. But we might still have the SOL in Hot3.
            return { success: false, error: `Buy failed: ${errText}` };
        }

        // 2. BURN TOKENS
        console.log(`   [Burn] Burning tokens...`);

        // Get ATA
        const ata = await getAssociatedTokenAddress(mint, payer.publicKey);

        // We need to know how much we bought to burn it all.
        // Retry fetching balance up to 12 times (approx 60s) to allow for RPC indexing
        let balance = 0;
        for (let i = 0; i < 12; i++) {
            try {
                // Wait increasing time: 3s + linear backoff
                await new Promise(r => setTimeout(r, 3000 + (i * 1000)));
                const tokenBalance = await connection.getTokenAccountBalance(ata);
                balance = tokenBalance.value.amount; // RAW Amount
                if (balance > 0) {
                    console.log(`   [Burn] Balance found: ${tokenBalance.value.uiAmount} (Attempt ${i + 1})`);
                    break;
                }
            } catch (e) {
                console.log(`   [Burn] Balance check failed (Attempt ${i + 1}):`, e.message);
            }
        }

        if (balance == 0) {
            console.log("   [Burn] Could not find token balance after retries. Burn skipped.");
            return { success: true, buyTx: buySignature, burnTx: null, note: "Buy success, Burn skipped (slow indexer)" };
        }

        if (balance > 0) {
            const burnTx = new Transaction().add(
                ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 }), // Priority Fee
                createBurnInstruction(
                    ata,
                    mint,
                    payer.publicKey,
                    BigInt(balance)
                )
            );

            const burnSignature = await sendAndConfirmTransaction(connection, burnTx, [payer], { commitment: 'confirmed' });
            console.log(`   [Burn] complete! TX: ${burnSignature}`);

            return {
                success: true,
                buyTx: buySignature,
                burnTx: burnSignature,
                amountBurned: balance
            };
        } else {
            console.log("   [Burn] Zero balance, nothing to burn.");
            return { success: true, buyTx: buySignature, burnTx: null };
        }

    } catch (error) {
        console.error("   [Buy/Burn] Error:", error.message);
        return { success: false, error: error.message };
    }
}
