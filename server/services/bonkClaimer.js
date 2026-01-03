import puppeteer from 'puppeteer';
import bs58 from 'bs58';

/**
 * Browser Automation for Bonk.fun Fee Claiming
 * Runs in background to claim USD1 creator fees
 */

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1456799241744679023/BC2HyGDt5GwD7NGDJPpW9c5ULn84wfcyBApeHrM5OP3zcqU51bNHC7Xvn1wMvjFxKvd6';

/**
 * Connect wallet to Bonk.fun using private key
 * Note: This requires browser with Phantom/Solflare extension or we use direct signing
 */
async function claimBonkFunFees(privateKeyBase58) {
    console.log('[BonkClaimer] Starting browser automation for Bonk.fun fee claim...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Run in background
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ]
        });

        const page = await browser.newPage();

        // Set user agent to look like regular browser
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        console.log('[BonkClaimer] Navigating to Bonk.fun profile...');
        await page.goto('https://bonk.fun/profile?tab=fees', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for page to fully load
        await page.waitForTimeout(3000);

        // Take screenshot for debugging
        const screenshotPath = '/tmp/bonkfun_fees.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`[BonkClaimer] Screenshot saved to ${screenshotPath}`);

        // Look for Connect Wallet button or Claim button
        const pageContent = await page.content();

        // Check if we need to connect wallet first
        if (pageContent.includes('Connect Wallet') || pageContent.includes('connect-wallet')) {
            console.log('[BonkClaimer] Wallet connection required - cannot proceed without browser wallet extension');

            // Notify via Discord
            await notifyDiscord('⚠️ Bonk.fun Claim Failed',
                'Browser automation cannot connect wallet without Phantom extension.\n' +
                'Please manually claim at: https://bonk.fun/profile?tab=fees'
            );

            return {
                success: false,
                error: 'Wallet connection required - browser extension needed',
                requiresManualAction: true
            };
        }

        // Try to find and click the USD1 Claim button
        const claimButtons = await page.$$('button');
        let claimButtonFound = false;

        for (const button of claimButtons) {
            const buttonText = await page.evaluate(el => el.textContent, button);
            if (buttonText && buttonText.toLowerCase().includes('claim')) {
                console.log(`[BonkClaimer] Found claim button: "${buttonText}"`);

                // Check if it's the USD1 claim
                const parentHtml = await page.evaluate(el => el.parentElement?.innerHTML || '', button);
                if (parentHtml.includes('USD1')) {
                    console.log('[BonkClaimer] This is the USD1 claim button!');
                    claimButtonFound = true;

                    // Click the button
                    await button.click();
                    console.log('[BonkClaimer] Clicked USD1 claim button');

                    // Wait for transaction modal/popup
                    await page.waitForTimeout(3000);

                    break;
                }
            }
        }

        if (!claimButtonFound) {
            console.log('[BonkClaimer] No USD1 claim button found - fees may already be claimed or unavailable');
            return { success: true, claimed: 0, note: 'No fees to claim' };
        }

        // Take final screenshot
        await page.screenshot({ path: '/tmp/bonkfun_after_claim.png', fullPage: true });

        await notifyDiscord('✅ Bonk.fun Claim Attempted',
            'Browser automation clicked the USD1 claim button.\n' +
            'Check your wallet for the transaction confirmation.'
        );

        return { success: true, claimed: 'pending' };

    } catch (error) {
        console.error('[BonkClaimer] Error:', error.message);

        await notifyDiscord('❌ Bonk.fun Claim Error', error.message);

        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

/**
 * Alternative approach: Use bonk.fun's internal API if we can find it
 * This would require reverse-engineering their frontend
 */
async function claimViaApi(walletAddress) {
    console.log('[BonkClaimer] Attempting API-based claim (experimental)...');

    try {
        // Try to fetch the fee data first
        const response = await fetch(`https://api.bonk.fun/v1/creator-rewards/${walletAddress}`, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('[BonkClaimer] Fee data:', data);
            return data;
        } else {
            console.log('[BonkClaimer] API returned:', response.status);
            return null;
        }
    } catch (error) {
        console.log('[BonkClaimer] API not available:', error.message);
        return null;
    }
}

/**
 * Send notification to Discord
 */
async function notifyDiscord(title, message) {
    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: title,
                    description: message,
                    color: title.includes('✅') ? 0x00ff00 : title.includes('❌') ? 0xff0000 : 0xffaa00,
                    timestamp: new Date().toISOString()
                }]
            })
        });
    } catch (e) {
        console.error('[BonkClaimer] Discord notify failed:', e.message);
    }
}

export { claimBonkFunFees, claimViaApi };
