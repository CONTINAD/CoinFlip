import { useState, useCallback } from "react";
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

const FLIP_INTERVAL = 120; // 2 minutes

// Mock data - replace with real data from your backend
const MOCK_WALLETS = [
  "7xKX...3mN9", "BvR2...pQ8k", "9aZx...W4yL", "mN3p...K7vR",
  "Qw8m...Xt2P", "Lp5z...Hj9N", "Yk4r...Bs6M", "Df2w...Ng8X"
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
  const [history, setHistory] = useState<FlipRecord[]>([]);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [totalBurned, setTotalBurned] = useState(0);
  const [totalToHolders, setTotalToHolders] = useState(0);
  const [devRewards, setDevRewards] = useState(0);
  const { toast } = useToast();

  const performFlip = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setShowResult(false);
    setCurrentResult(null);

    setTimeout(() => {
      const result = Math.random() > 0.5 ? "burn" : "holder";
      const amount = Math.floor(Math.random() * 50000) + 10000;
      const devCut = Math.floor(amount * 0.02); // 2% dev fee
      const netAmount = amount - devCut;
      
      setCurrentResult(result);
      setIsFlipping(false);
      setShowResult(true);

      // Update history
      const newRecord: FlipRecord = {
        id: Date.now(),
        result,
        timestamp: new Date(),
      };
      setHistory((prev) => [...prev, newRecord]);

      // Update winners
      const newWinner: WinnerRecord = {
        id: Date.now(),
        type: result,
        wallet: result === "holder" ? MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)] : undefined,
        amount: netAmount,
        txHash: generateMockTxHash(),
        timestamp: new Date(),
      };
      setWinners((prev) => [...prev, newWinner]);

      // Update totals
      if (result === "burn") {
        setTotalBurned((prev) => prev + netAmount);
      } else {
        setTotalToHolders((prev) => prev + netAmount);
      }
      setDevRewards((prev) => prev + devCut);

      toast({
        title: result === "burn" ? "🔥 Buyback & Burn!" : "🎁 Holder Wins!",
        description: `${netAmount.toLocaleString()} tokens ${result === "burn" ? "burned" : "sent to lucky holder"}`,
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
      description: isRunning 
        ? "Click play to resume" 
        : "Next flip in 2 minutes",
    });
  };

  const resetHistory = () => {
    setHistory([]);
    setWinners([]);
    setTotalBurned(0);
    setTotalToHolders(0);
    setDevRewards(0);
    toast({ title: "Reset complete" });
  };

  return (
    <div className="min-h-screen relative">
      <CasinoBackground />
      <CasinoResult result={currentResult} isVisible={showResult} />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <span className="text-lg">🪙</span>
              </div>
              <div>
                <h1 className="font-semibold text-sm tracking-tight">COINFLIP</h1>
                <p className="text-[10px] text-muted-foreground">Burn or Reward</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live" />
                <span className="text-[10px] font-medium text-primary uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Rewards panel */}
          <div className="mb-8">
            <RewardsPanel 
              totalBurned={totalBurned}
              totalToHolders={totalToHolders}
              devRewards={devRewards}
              totalFlips={history.length}
            />
          </div>

          {/* Main game area */}
          <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-start mb-8">
            {/* Left - Timer */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[220px]">
                <CasinoTimer
                  seconds={FLIP_INTERVAL}
                  onComplete={performFlip}
                  isRunning={isRunning && !isFlipping}
                />
              </div>
            </div>

            {/* Center - Coin & Controls */}
            <div className="flex flex-col items-center gap-6">
              <CasinoCoin isFlipping={isFlipping} result={currentResult} />
              
              {/* Controls */}
              <div className="flex flex-col items-center gap-3">
                <Button
                  onClick={performFlip}
                  disabled={isFlipping}
                  className="min-w-[140px] h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isFlipping ? "Flipping..." : "Flip Now"}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleAutoFlip}
                    className="w-10 h-10 rounded-xl border-border bg-card hover:bg-muted"
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetHistory}
                    className="w-10 h-10 rounded-xl border-border bg-card hover:bg-muted"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Right - Live Feed */}
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-[280px]">
                <LiveFeed history={history} />
              </div>
            </div>
          </div>

          {/* Winners Panel */}
          <div className="mb-8">
            <WinnersPanel winners={winners} />
          </div>

          {/* How it works */}
          <div className="stake-card rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">How It Works</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-3">
              <div className="flex gap-3 p-3 rounded-lg bg-ember/5 border border-ember/10">
                <div className="w-9 h-9 rounded-lg bg-ember/10 flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4 text-ember" />
                </div>
                <div>
                  <p className="text-xs font-medium text-ember mb-0.5">Buyback & Burn</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Tokens bought from market and permanently burned.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 rounded-lg bg-royal/5 border border-royal/10">
                <div className="w-9 h-9 rounded-lg bg-royal/10 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4 text-royal" />
                </div>
                <div>
                  <p className="text-xs font-medium text-royal mb-0.5">Random Holder</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Lucky token holder selected to receive reward.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-medium text-primary mb-0.5">Auto Flip</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Automatic coin flip every 2 minutes, 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center mt-8 pb-6">
            <p className="text-[10px] text-muted-foreground">
              50/50 odds • 2% dev fee • All transactions on Solana
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Index;
