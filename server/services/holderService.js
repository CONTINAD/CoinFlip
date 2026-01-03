import { config } from '../config.js';
import { Connection, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Holder Selection Service
 * Fetches real token holders and selects a random winner
 */

let connection = null;

try {
    if (config.rpcUrl) {
        connection = new Connection(config.rpcUrl, 'confirmed');
    }
} catch (e) {
    console.error("HolderService init error:", e.message);
}

// Wallets to NEVER send rewards to
const BANNED_WALLETS = [
    "9Jvc9u1J29F86GLzBQqe6RwyYcxeGHP9rXCtk1CHvhZN", // Creator wallet
    "1111111111111111111111111111111111111111111", // System
    "Buyback & Burn",
];

/**
 * Fetch top token holders and select a random winner
 * @returns {Promise<string|null>} Winner wallet address or null if failed
 */
export async function selectRandomHolder() {
    console.log('🎯 Selecting random token holder...');

    if (!config.tokenMint) {
        console.log('   ❌ TOKEN_MINT_ADDRESS not configured');
        return null;
    }

    try {
        const mintPubkey = new PublicKey(config.tokenMint);

        // Get the top 20 token holders
        const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);

        if (!largestAccounts?.value?.length) {
            console.log('   ❌ No token holders found');
            return null;
        }

        console.log(`   📊 Found ${largestAccounts.value.length} holder accounts`);

        // Get the owner of each token account
        const eligibleHolders = [];

        for (const account of largestAccounts.value) {
            // Skip accounts with 0 balance
            if (account.uiAmount === 0) continue;

            try {
                // Get the token account info to find the owner
                const accountInfo = await connection.getParsedAccountInfo(account.address);

                if (accountInfo?.value?.data?.parsed?.info?.owner) {
                    const owner = accountInfo.value.data.parsed.info.owner;

                    // Skip banned wallets
                    if (!BANNED_WALLETS.includes(owner)) {
                        eligibleHolders.push({
                            wallet: owner,
                            balance: account.uiAmount
                        });
                    }
                }
            } catch (e) {
                console.log(`   ⚠️ Failed to get owner for ${account.address.toBase58()}`);
            }
        }

        if (eligibleHolders.length === 0) {
            console.log('   ❌ No eligible holders found (all banned or invalid)');
            return null;
        }

        console.log(`   ✅ ${eligibleHolders.length} eligible holders`);

        // Select a random winner
        const randomIndex = Math.floor(Math.random() * eligibleHolders.length);
        const winner = eligibleHolders[randomIndex];

        console.log(`   🏆 Winner: ${winner.wallet} (holds ${winner.balance.toLocaleString()} tokens)`);

        return winner.wallet;

    } catch (error) {
        console.error('   ❌ Failed to select holder:', error.message);
        return null;
    }
}

export default { selectRandomHolder };
