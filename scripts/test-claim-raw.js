
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { config } from '../server/config.js';

// Standalone script to test Pump.fun Fee Claim API RAW
// Run with: node scripts/test-claim-raw.js

async function testClaim() {
    console.log("🔍 Testing Pump.fun Fee Claim API (Raw Mode)...");

    if (!config.creatorPrivateKey) {
        console.error("❌ No Private Key in .env");
        return;
    }

    const secretKey = bs58.decode(config.creatorPrivateKey);
    const creatorKeypair = Keypair.fromSecretKey(secretKey);
    const pubKey = creatorKeypair.publicKey.toBase58();

    console.log(`👤 Wallet: ${pubKey}`);

    const payload = {
        publicKey: pubKey,
        action: 'collectCreatorFee',
        priorityFee: 0.0001,
        pool: 'pump'
    };

    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    try {
        const response = await fetch('https://pumpportal.fun/api/trade-local', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log(`📡 Status: ${response.status} ${response.statusText}`);

        if (response.status === 200) {
            console.log("✅ API Success (200 OK)");
            // It returns binary data usually
            const buffer = await response.arrayBuffer();
            console.log(`📥 Received ${buffer.byteLength} bytes of transaction data.`);

            // Try to deserialize to prove it's valid
            try {
                const tx = VersionedTransaction.deserialize(new Uint8Array(buffer));
                console.log("✅ Transaction Deserialized Successfully!");
                console.log("   Ready to sign & send.");
            } catch (e) {
                console.error("❌ Failed to deserialize transaction:", e.message);
            }

        } else {
            const text = await response.text();
            console.error("❌ API Error Body:", text);
        }

    } catch (e) {
        console.error("❌ Network/Fetch Error:", e);
    }
}

testClaim();
