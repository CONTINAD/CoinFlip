import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Zap, Flame, Gift, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CasinoBackground from "@/components/CasinoBackground";
import CasinoCoin from "@/components/CasinoCoin";
import CasinoTimer from "@/components/CasinoTimer";
import CasinoResult from "@/components/CasinoResult";
import RewardsPanel from "@/components/RewardsPanel";
import WinnersPanel, { WinnerRecord } from "@/components/WinnersPanel";
import LiveFeed, { FlipRecord } from "@/components/LiveFeed";
import Leaderboard, { LeaderboardEntry } from "@/components/Leaderboard";
import { cn } from "@/lib/utils";
import coinLogo from "@/assets/coin-logo.png";
import pumpfunLogo from "@/assets/pumpfun-logo.png";

const FLIP_INTERVAL = 120;

// Solana Logo Component
const SolanaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 397.7 311.7" className={className} fill="currentColor">
    <linearGradient id="sol-main" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientTransform="matrix(1 0 0 -1 0 314)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#00FFA3" />
      <stop offset="1" stopColor="#DC1FFF" />
    </linearGradient>
    <path fill="url(#sol-main)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" />
    <path fill="url(#sol-main)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" />
    <path fill="url(#sol-main)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" />
  </svg>
);

// X (Twitter) Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const MOCK_WALLETS = [
  "7xKXp3mN9vWq", "BvR2pQ8kLmNx", "9aZxW4yLmPqR", "mN3pK7vRsTuW",
  "Qw8mXt2PnYzA", "Lp5zHj9NcBvD", "Yk4rBs6MqFgH", "Df2wNg8XvJkL"
];

const generateMockTxHash = () => {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let hash = "";
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

const Index = () => {
  const [isRunning, setIsRunning] = useState(true); // Always true now
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentResult, setCurrentResult] = useState<"burn" | "holder" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>();
  const [currentWallet, setCurrentWallet] = useState<string | undefined>();
  const [currentAmount, setCurrentAmount] = useState<number | undefined>();
  const [burnedTokenAmount, setBurnedTokenAmount] = useState<number | undefined>();
  const [history, setHistory] = useState<FlipRecord[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [totalBurnedSol, setTotalBurnedSol] = useState(0);
  const [totalToHoldersSol, setTotalToHoldersSol] = useState(0);
  const [devRewardsSol, setDevRewardsSol] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(FLIP_INTERVAL); // Synced from server
  const { toast } = useToast();

  // Use ref to track busy state inside setInterval closure
  const isBusyRef = useRef(false);
  useEffect(() => {
    isBusyRef.current = isFlipping || isProcessing;
  }, [isFlipping, isProcessing]);

  const [tokenMint, setTokenMint] = useState<string>("");

  // Fetch stats and history periodically
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setTotalToHoldersSol(data.totalSolDistributed || 0);
          setTotalBurnedSol(data.totalSolBurned || 0);
          if (data.tokenMint) setTokenMint(data.tokenMint);

          // Sync History
          if (data.history && Array.isArray(data.history)) {
            setHistory((prev) => {
              return data.history.map((h: any) => ({
                id: h.id,
                result: h.result,
                timestamp: new Date(h.timestamp)
              }));
            });

            // Sync Winners
            const newWinners = data.history.map((h: any) => ({
              id: h.id,
              type: h.result,
              wallet: h.wallet,
              amount: h.amount,
              txHash: h.txHash,
              timestamp: new Date(h.timestamp)
            }));
            setWinners(newWinners);
          }
          // Sync timer from server's nextFlipTime
          if (data.nextFlipTime) {
            const now = Date.now();
            const nextFlip = new Date(data.nextFlipTime).getTime();
            const remaining = Math.max(0, Math.floor((nextFlip - now) / 1000));
            // Only update if drift is significant (>2s) to avoid jumping
            setTimeLeft((prev) => Math.abs(prev - remaining) > 2 ? remaining : prev);
          }
        }
      } catch (e) {
        console.error("Failed to load stats:", e);
      }
    };

    fetchStats(); // Initial
    const pollInterval = setInterval(fetchStats, 5000); // Poll every 5s for Sync

    // Fluid Countdown (1s)
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        // T-10 Seconds: Trigger the API Call (Pre-Claim)
        // Use isBusyRef to avoid stale closure (isFlipping/isProcessing are captured at mount)
        if (prev === 10 && !isBusyRef.current) {
          performFlip();
        }

        // T-0 Seconds: Logic to handle reset or hold
        if (prev <= 1) {
          // KEY FIX: If we are still waiting for API (flipping) or showing result (processing),
          // HOLD the timer at 0. Do NOT reset until we are done.
          if (isBusyRef.current) {
            return 0;
          }
          return FLIP_INTERVAL;
        }
        return Math.max(0, prev - 1);
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Calculate leaderboard entries from winners
  const leaderboardEntries = useMemo((): LeaderboardEntry[] => {
    // If winners are empty, leaderboard will be empty. 
    // This relies on the backend history being populated.
    const holderWins = winners.filter(w => w.type === "holder" && w.wallet);
    const walletStats: Record<string, { totalWins: number; totalAmount: number; lastWin: Date }> = {};

    holderWins.forEach(win => {
      const wallet = win.wallet!;
      if (!walletStats[wallet]) {
        walletStats[wallet] = { totalWins: 0, totalAmount: 0, lastWin: win.timestamp };
      }
      walletStats[wallet].totalWins++;
      walletStats[wallet].totalAmount += win.amount;
      if (win.timestamp > walletStats[wallet].lastWin) {
        walletStats[wallet].lastWin = win.timestamp;
      }
    });

    return Object.entries(walletStats)
      .map(([wallet, stats], index) => ({
        id: index,
        wallet,
        ...stats
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
  }, [winners]);

  const performFlip = useCallback(async () => {
    if (isFlipping || isProcessing) return;

    setIsFlipping(true);
    setShowResult(false);
    setCurrentResult(null);

    try {
      // Prepare UI for flip
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2044/2044-preview.mp3"); // Flip sound if available
      audio.volume = 0.5;
      audio.play().catch(() => { });

      // Call Backend API (Happens at T-10s)
      const response = await fetch('/api/claim-flip', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Flip failed: ${response.statusText}`);
      }

      const data = await response.json();

      // --- WAIT FOR TIMER TO HIT ZERO (with timeout fallback) ---
      // We have the data, now we wait for the visual countdown.
      // Max wait: 15 seconds to prevent getting stuck forever.
      await new Promise<void>((resolve) => {
        const startWait = Date.now();
        const maxWait = 15000; // 15 seconds max

        const checkTimer = setInterval(() => {
          // Timeout fallback - don't wait forever
          if (Date.now() - startWait > maxWait) {
            console.log('Timer wait timeout - proceeding anyway');
            clearInterval(checkTimer);
            resolve();
            return;
          }

          setTimeLeft((current) => {
            if (current <= 2) {
              clearInterval(checkTimer);
              resolve();
            }
            return current; // Don't modify, just read
          });
        }, 500);
      });

      // Coin lands -> Now "Processing..." logic (Visual only, data is ready)
      setIsFlipping(false); // Stop spinning
      setIsProcessing(true); // Show "Processing..."

      // Small delay for effect
      await new Promise(r => setTimeout(r, 1000));

      setIsProcessing(false);

      const result = data.flipResult; // 'burn' or 'holder'
      const solValue = parseFloat(data.amount);
      // Use result-specific TX hash for Solscan
      const txHash = result === 'burn'
        ? (data.buyTx || data.burnTx || data.claimSignature)
        : (data.transferSignature || data.claimSignature);
      const wallet = data.winner;

      setCurrentResult(result);
      setCurrentTxHash(txHash);
      setCurrentWallet(wallet);
      setCurrentAmount(solValue);
      // Hack: Store token amount in a new state or just use the raw data if available
      // Let's add a state for it
      if (data.burnedAmount) {
        setBurnedTokenAmount(Number(data.burnedAmount) / 1000000); // Decimals 6
      } else {
        setBurnedTokenAmount(undefined);
      }
      setShowResult(true);

      const newRecord: FlipRecord = {
        id: Date.now(),
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [newRecord, ...prev]); // Newest first

      const newWinner: WinnerRecord = {
        id: Date.now(),
        type: result,
        wallet,
        amount: solValue,
        txHash,
        timestamp: new Date(),
      };
      setWinners((prev) => [newWinner, ...prev]); // Newest first

      if (result === "burn") {
        setTotalBurnedSol((prev) => prev + solValue);
      } else {
        setTotalToHoldersSol((prev) => prev + solValue);
      }
      // Simplified dev reward tracking for now
      setDevRewardsSol((prev) => prev + (solValue * 0.02));

      toast({
        title: result === "burn" ? "🔥 Buyback & Burn!" : "🎁 Holder Wins!",
        description: `${solValue.toFixed(4)} SOL ${result === "burn" ? "burned" : "sent to holder"}`,
      });

      setTimeout(() => {
        setShowResult(false);
      }, 5000); // Give them time to click the link

    } catch (error: any) {
      console.error("Flip failed:", error);
      toast({
        title: "Error",
        description: "Failed to perform flip. Is backend running?",
        variant: "destructive"
      });
      setIsFlipping(false);
      setIsProcessing(false);
    }
  }, [isFlipping, isProcessing, toast]);

  const toggleAutoFlip = () => {
    setIsRunning((prev) => !prev);
    toast({
      title: isRunning ? "Auto-flip paused" : "Auto-flip resumed",
      description: isRunning ? "Click play to resume" : "Next flip in 2 minutes",
    });
  };

  const resetHistory = () => {
    setHistory([]);
    setWinners([]);
    setTotalBurnedSol(0);
    setTotalToHoldersSol(0);
    setDevRewardsSol(0);
    toast({ title: "Reset complete" });
  };

  return (
    <div className="min-h-screen relative">
      <CasinoBackground />
      <CasinoResult
        result={currentResult}
        isVisible={showResult || isProcessing}
        txHash={currentTxHash}
        wallet={currentWallet}
        amount={currentAmount}
        tokenAmount={burnedTokenAmount}
        isProcessing={isProcessing}
      />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="border-b border-border/40 glass sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={coinLogo}
                  alt="$COINFLIP Logo"
                  className="w-11 h-11 object-contain drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-tight">
                  $COINFLIP
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Powered by <SolanaLogo className="w-3.5 h-3.5" /> <span className="text-gradient-solana font-medium">Solana</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Buy $COINFLIP on PumpFun */}
              <a
                href={tokenMint ? `https://pump.fun/${tokenMint}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3fc99d]/15 border border-[#3fc99d]/40 hover:bg-[#3fc99d]/25 hover:border-[#3fc99d]/60 transition-all duration-300"
              >
                <span className="text-sm font-bold text-[#3fc99d]">Buy $COINFLIP</span>
                <img src={pumpfunLogo} alt="PumpFun" className="w-6 h-6 object-contain" />
              </a>

              {/* X (Twitter) Link */}
              <a
                href="https://x.com/coinflipdotfun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl glass-premium border border-border/40 hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-300"
              >
                <XLogo className="w-4 h-4 text-foreground" />
              </a>

              {/* Live indicator */}
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/25">
                <div className="w-2 h-2 rounded-full bg-primary animate-live" />
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Rewards panel */}
          <section className="mb-10">
            <RewardsPanel
              totalBurnedSol={totalBurnedSol}
              totalToHoldersSol={totalToHoldersSol}
              devRewardsSol={devRewardsSol}
              totalFlips={history.length}
            />
          </section>

          {/* Main game area */}
          <section className="grid lg:grid-cols-[300px_1fr_300px] gap-6 lg:gap-8 items-start mb-10">
            {/* Left - Timer */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="w-full max-w-[280px]">
                <CasinoTimer
                  seconds={FLIP_INTERVAL}
                  timeLeft={timeLeft}
                  onComplete={performFlip}
                  isRunning={isRunning && !isFlipping}
                />
              </div>
            </div>

            {/* Center - Coin & Controls */}
            <div className="flex flex-col items-center gap-8 order-1 lg:order-2 py-4">
              <CasinoCoin isFlipping={isFlipping} result={currentResult} />

              <div className="flex flex-col items-center gap-5">
                <div className={cn(
                  "min-w-[200px] h-14 px-10 flex items-center justify-center gap-2",
                  "bg-gradient-to-r from-primary/20 via-[#0ea87a]/20 to-primary/20",
                  "text-primary font-bold text-base rounded-2xl",
                  "border border-primary/30",
                  "cursor-default"
                )}>
                  <Zap className="w-5 h-5 animate-pulse" />
                  {isFlipping ? "Flipping..." : isProcessing ? "Processing..." : "Auto-Flipping"}
                </div>

                <p className="text-[10px] text-muted-foreground/50 text-center max-w-[220px]">
                  Auto-flip every 2 minutes • 50/50 odds • Verifiable on-chain
                </p>
              </div>
            </div>

            {/* Right - Live Feed */}
            <div className="flex justify-center lg:justify-start order-3">
              <div className="w-full max-w-[300px]">
                <LiveFeed history={history} />
              </div>
            </div>
          </section>

          {/* Contract Address Display */}
          {tokenMint && (
            <section className="mb-6">
              <div className="rounded-2xl glass-premium p-4 border border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
                      <span className="text-primary font-bold text-sm">CA</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Contract Address</span>
                      <code className="text-sm font-mono text-primary break-all">{tokenMint}</code>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(tokenMint);
                    }}
                    className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-sm font-medium transition-all"
                  >
                    Copy CA
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Leaderboard & Burn Stats */}
          <section className="mb-10">
            <Leaderboard entries={leaderboardEntries} totalBurnedSol={totalBurnedSol} />
          </section>

          {/* Winners Panel */}
          <section className="mb-10">
            <WinnersPanel winners={winners} />
          </section>

          {/* How it works */}
          <section className="rounded-2xl overflow-hidden glass-premium p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center border border-border/50">
                <Info className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <span className="text-base font-semibold block">How It Works</span>
                <span className="text-[10px] text-muted-foreground">Simple, transparent, on-chain</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div className="group flex gap-4 p-5 rounded-xl bg-gradient-to-br from-ember/10 via-ember/5 to-transparent border border-ember/20 hover:border-ember/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-ember/15 flex items-center justify-center shrink-0 border border-ember/20 group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-6 h-6 text-ember" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ember mb-1">Buyback & Burn</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Tokens bought from market and permanently burned, reducing total supply forever.
                  </p>
                </div>
              </div>

              <div className="group flex gap-4 p-5 rounded-xl bg-gradient-to-br from-royal/10 via-royal/5 to-transparent border border-royal/20 hover:border-royal/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-royal/15 flex items-center justify-center shrink-0 border border-royal/20 group-hover:scale-110 transition-transform duration-300">
                  <Gift className="w-6 h-6 text-royal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-royal mb-1">Random Holder</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Lucky token holder randomly selected to receive the reward. Hold to be eligible!
                  </p>
                </div>
              </div>

              <div className="group flex gap-4 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 hover:border-primary/40 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">Auto Flip</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Automatic coin flip every 2 minutes, running 24/7 non-stop. All on-chain.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center mt-14 pb-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <SolanaLogo className="w-6 h-6" />
              <span className="text-sm text-muted-foreground font-medium">Built on Solana</span>
            </div>
            <p className="text-[11px] text-muted-foreground/40 max-w-md mx-auto">
              50/50 odds • 2% dev fee • All transactions verifiable on Solscan • Smart contract audited
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;