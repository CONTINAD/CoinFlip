import { Keypair, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from '../config.js';
import { buyAndBurn } from './swapService.js';

/**
 * Test script to execute buyAndBurn on a specific wallet
 * Usage: node server/services/test-burn.js
 */

const HOP3_PRIVATE_KEY = '3D3gqLHbiPMwHoAQdjUFQeyhfFzLcUxk7qAWachRjai8rigGdKCwFU1JaG7pXCZzSCCGewTYwB5cqL4Ux5jrwddi';

async function testBuyAndBurn() {
    console.log('🧪 Testing Buy and Burn...\n');

    // Decode the private key
    const hop3Keypair = Keypair.fromSecretKey(bs58.decode(HOP3_PRIVATE_KEY));
    console.log(`Hop3 Wallet: ${hop3Keypair.publicKey.toBase58()}`);

    // Check balance
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const balance = await connection.getBalance(hop3Keypair.publicKey);
    console.log(`Balance: ${balance / 1e9} SOL`);

    if (balance < 1000000) { // Less than 0.001 SOL
        console.log('❌ Insufficient balance for test');
        return;
    }

    // Calculate buy amount (leave 0.003 SOL for gas + rent)
    const buyAmount = (balance / 1e9) - 0.003;
    console.log(`Buy Amount: ${buyAmount.toFixed(6)} SOL`);
    console.log(`Token Mint: ${config.tokenMint}`);

    console.log('\n--- Executing buyAndBurn ---\n');

    const result = await buyAndBurn(hop3Keypair, buyAmount);

    console.log('\n--- Result ---');
    console.log(JSON.stringify(result, null, 2));
}

testBuyAndBurn().catch(console.error);
