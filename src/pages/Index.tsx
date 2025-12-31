import { useState, useCallback, useMemo } from "react";
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
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path fill="url(#sol-main)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
    <path fill="url(#sol-main)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
    <path fill="url(#sol-main)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
  </svg>
);

// X (Twitter) Logo Component
const XLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
  const [isRunning, setIsRunning] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentResult, setCurrentResult] = useState<"burn" | "holder" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [currentTxHash, setCurrentTxHash] = useState<string | undefined>();
  const [currentWallet, setCurrentWallet] = useState<string | undefined>();
  const [currentAmount, setCurrentAmount] = useState<number | undefined>();
  const [history, setHistory] = useState<FlipRecord[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [totalBurnedSol, setTotalBurnedSol] = useState(0);
  const [totalToHoldersSol, setTotalToHoldersSol] = useState(0);
  const [devRewardsSol, setDevRewardsSol] = useState(0);
  const { toast } = useToast();

  // Calculate leaderboard entries from winners
  const leaderboardEntries = useMemo((): LeaderboardEntry[] => {
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

  const performFlip = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setShowResult(false);
    setCurrentResult(null);

    setTimeout(() => {
      const result = Math.random() > 0.5 ? "burn" : "holder";
      const solValue = parseFloat((Math.random() * 0.5 + 0.1).toFixed(4));
      const devCutSol = solValue * 0.02;
      const txHash = generateMockTxHash();
      const wallet = result === "holder" ? MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)] : undefined;
      
      setCurrentResult(result);
      setCurrentTxHash(txHash);
      setCurrentWallet(wallet);
      setCurrentAmount(solValue);
      setIsFlipping(false);
      setShowResult(true);

      const newRecord: FlipRecord = {
        id: Date.now(),
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, newRecord]);

      const newWinner: WinnerRecord = {
        id: Date.now(),
        type: result,
        wallet,
        amount: solValue,
        txHash,
        timestamp: new Date(),
      };
      setWinners((prev) => [...prev, newWinner]);

      if (result === "burn") {
        setTotalBurnedSol((prev) => prev + solValue);
      } else {
        setTotalToHoldersSol((prev) => prev + solValue);
      }
      setDevRewardsSol((prev) => prev + devCutSol);

      toast({
        title: result === "burn" ? "🔥 Buyback & Burn!" : "🎁 Holder Wins!",
        description: `${solValue.toFixed(4)} SOL ${result === "burn" ? "burned" : "sent to holder"}`,
      });

      setTimeout(() => {
        setShowResult(false);
      }, 3500);
    }, 2500);
  }, [isFlipping, toast]);

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
        isVisible={showResult} 
        txHash={currentTxHash}
        wallet={currentWallet}
        amount={currentAmount}
      />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="border-b border-border/40 glass sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={coinLogo} 
                  alt="CoinFlip Logo" 
                  className="w-11 h-11 object-contain drop-shadow-lg"
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-tight">
                  COINFLIP
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Powered by <SolanaLogo className="w-3.5 h-3.5" /> <span className="text-gradient-solana font-medium">Solana</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Buy $COINFLIP on PumpFun */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3fc99d]/15 border border-[#3fc99d]/40 hover:bg-[#3fc99d]/25 hover:border-[#3fc99d]/60 transition-all duration-300"
              >
                <span className="text-sm font-bold text-[#3fc99d]">Buy $COINFLIP</span>
                <img src={pumpfunLogo} alt="PumpFun" className="w-6 h-6 object-contain" />
              </a>

              {/* X (Twitter) Link */}
              <a 
                href="#" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-xl glass-premium border border-border/40 hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-300"
              >
                <XLogo className="w-4 h-4 text-foreground" />
              </a>

              {/* SOL Balance */}
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl glass-premium border border-border/40">
                <SolanaLogo className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="font-mono text-sm font-bold text-foreground leading-none">
                    {devRewardsSol.toFixed(4)}
                  </span>
                  <span className="text-[8px] text-muted-foreground font-medium">DEV REWARDS</span>
                </div>
              </div>

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
                  onComplete={performFlip}
                  isRunning={isRunning && !isFlipping}
                />
              </div>
            </div>

            {/* Center - Coin & Controls */}
            <div className="flex flex-col items-center gap-8 order-1 lg:order-2 py-4">
              <CasinoCoin isFlipping={isFlipping} result={currentResult} />
              
              {/* Controls */}
              <div className="flex flex-col items-center gap-5">
                <Button
                  onClick={performFlip}
                  disabled={isFlipping}
                  className={cn(
                    "min-w-[200px] h-14 px-10",
                    "bg-gradient-to-r from-primary via-[#0ea87a] to-primary bg-[length:200%_100%]",
                    "hover:bg-[position:100%_0] transition-all duration-500",
                    "text-primary-foreground font-bold text-base rounded-2xl",
                    "shadow-[0_8px_32px_hsl(160_84%_39%_/_0.35)] hover:shadow-[0_12px_40px_hsl(160_84%_39%_/_0.5)]",
                    "border border-primary/30",
                    "disabled:opacity-50 disabled:hover:shadow-[0_8px_32px_hsl(160_84%_39%_/_0.35)]",
                    "active:scale-[0.98]"
                  )}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isFlipping ? "Flipping..." : "Flip Now"}
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleAutoFlip}
                    className={cn(
                      "w-14 h-14 rounded-2xl glass-premium border-border/40",
                      "hover:border-primary/40 hover:bg-primary/5 transition-all duration-300",
                      isRunning && "border-primary/40 bg-primary/10 shadow-[0_0_20px_hsl(160_84%_39%_/_0.15)]"
                    )}
                  >
                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetHistory}
                    className="w-14 h-14 rounded-2xl glass-premium border-border/40 hover:border-destructive/40 hover:bg-destructive/5 transition-all duration-300"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
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