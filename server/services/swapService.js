import { config } from '../config.js';
import { Connection, PublicKey, VersionedTransaction, Keypair, Transaction, sendAndConfirmTransaction, ComputeBudgetProgram } from '@solana/web3.js';
import { getAssociatedTokenAddress, createBurnInstruction, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAccount } from '@solana/spl-token';
// import fetch from 'node-fetch'; // Using native Node.js fetch
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

        // PumpPortal Trade API - with RETRY logic (up to 3 attempts)
        let buySignature = null;
        let buySuccess = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`   [Buy] Attempt ${attempt}/3...`);

            try {
                const response = await fetch('https://pumpportal.fun/api/trade-local', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        publicKey: payer.publicKey.toBase58(),
                        action: 'buy',
                        mint: config.tokenMint,
                        amount: amountSol,
                        denominatedInSol: 'true',
                        slippage: 15, // Higher slippage for small amounts
                        priorityFee: 0.00005, // Lower fee for small buys
                        pool: 'pump'
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
                    buySuccess = true;
                    break; // Success, exit retry loop
                } else {
                    const errText = await response.text();
                    console.error(`   [Buy] Attempt ${attempt} failed: ${errText}`);
                    if (attempt < 3) {
                        await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
                    }
                }
            } catch (e) {
                console.error(`   [Buy] Attempt ${attempt} error: ${e.message}`);
                if (attempt < 3) {
                    await new Promise(r => setTimeout(r, 2000));
                }
            }
        }

        if (!buySuccess) {
            console.error(`   [Buy] Failed after 3 attempts`);

            // Log failure to Discord for debugging
            try {
                await fetch('https://discord.com/api/webhooks/1456799241744679023/BC2HyGDt5GwD7NGDJPpW9c5ULn84wfcyBApeHrM5OP3zcqU51bNHC7Xvn1wMvjFxKvd6', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        embeds: [{
                            title: '❌ Buy Failed After 3 Retries',
                            color: 0xff0000,
                            fields: [
                                { name: 'Amount', value: `${amountSol.toFixed(6)} SOL`, inline: true },
                                { name: 'Token Mint', value: config.tokenMint || 'NOT SET', inline: true },
                                { name: 'Hot Wallet', value: payer.publicKey.toBase58(), inline: false }
                            ]
                        }]
                    })
                });
            } catch (e) { /* ignore */ }

            return { success: false, error: 'Buy failed after 3 retries' };
        }

        // 2. BURN TOKENS
        console.log(`   [Burn] Burning tokens...`);

        // Check Mint Program ID (Standard vs Token-2022)
        const mintInfo = await connection.getAccountInfo(mint);
        if (!mintInfo) {
            console.log("   ❌ Mint not found");
            return { success: true, buyTx: buySignature, burnTx: null, note: "Mint not found" };
        }
        const programId = mintInfo.owner; // This will be TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID
        console.log(`   [Burn] Mint Program: ${programId.toBase58()}`);

        const ata = await getAssociatedTokenAddress(mint, payer.publicKey, false, programId);

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
                    BigInt(balance),
                    [],
                    programId // Pass correct program ID
                )
            );

            try {
                const signature = await sendAndConfirmTransaction(connection, burnTx, [payer], { commitment: 'confirmed' });
                console.log(`   [Burn] Burn TX: ${signature}`);
                return {
                    success: true,
                    buyTx: buySignature,
                    burnTx: signature,
                    amountBurned: balance // Return raw amount
                };
            } catch (e) {
                console.error(`   [Burn] Failed to burn: ${e.message}`);
                return { success: true, buyTx: buySignature, burnTx: null, error: e.message };
            }
        }

        return { success: true, buyTx: buySignature, burnTx: null };
    } catch (error) {
        console.error("   [Buy/Burn] Error:", error.message);
        return { success: false, error: error.message };
    }
}
