import dotenv from 'dotenv';
dotenv.config();

export const config = {
    // Blockchain
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    tokenMint: process.env.TOKEN_MINT_ADDRESS,

    // Wallets
    creatorPrivateKey: process.env.CREATOR_WALLET_PRIVATE_KEY,
    feeWallet: process.env.FEE_WALLET_ADDRESS,
    feePrivateKey: process.env.FEE_WALLET_PRIVATE_KEY,

    // Server
    port: parseInt(process.env.PORT) || 3000,
};

export function validateConfig() {
    const warnings = [];

    if (!config.tokenMint) warnings.push('TOKEN_MINT_ADDRESS not set');
    if (!config.creatorPrivateKey) warnings.push('CREATOR_WALLET_PRIVATE_KEY not set');

    if (warnings.length > 0) {
        console.warn('⚠️  Config warnings:', warnings.join(', '));
        console.warn('   Running in SIMULATION MODE');
    }

    return warnings.length === 0;
}
