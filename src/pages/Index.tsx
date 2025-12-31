import { useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Zap, Flame, Gift, Info, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CasinoBackground from "@/components/CasinoBackground";
import CasinoCoin from "@/components/CasinoCoin";
import CasinoTimer from "@/components/CasinoTimer";
import CasinoResult from "@/components/CasinoResult";
import RewardsPanel from "@/components/RewardsPanel";
import WinnersPanel, { WinnerRecord } from "@/components/WinnersPanel";
import LiveFeed, { FlipRecord } from "@/components/LiveFeed";
import { cn } from "@/lib/utils";

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

const MOCK_WALLETS = [
  "7xKXp3mN9", "BvR2pQ8kL", "9aZxW4yLm", "mN3pK7vRs",
  "Qw8mXt2Pn", "Lp5zHj9Nc", "Yk4rBs6Mq", "Df2wNg8Xv"
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
  const [devRewardsSol, setDevRewardsSol] = useState(0);
  const { toast } = useToast();

  const performFlip = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setShowResult(false);
    setCurrentResult(null);

    setTimeout(() => {
      const result = Math.random() > 0.5 ? "burn" : "holder";
      const amount = Math.floor(Math.random() * 50000) + 10000;
      const solValue = (Math.random() * 0.5 + 0.1);
      const devCutSol = solValue * 0.02;
      
      setCurrentResult(result);
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
        wallet: result === "holder" ? MOCK_WALLETS[Math.floor(Math.random() * MOCK_WALLETS.length)] : undefined,
        amount,
        txHash: generateMockTxHash(),
        timestamp: new Date(),
      };
      setWinners((prev) => [...prev, newWinner]);

      if (result === "burn") {
        setTotalBurned((prev) => prev + amount);
      } else {
        setTotalToHolders((prev) => prev + amount);
      }
      setDevRewardsSol((prev) => prev + devCutSol);

      toast({
        title: result === "burn" ? "🔥 Buyback & Burn!" : "🎁 Holder Wins!",
        description: `${amount.toLocaleString()} tokens ${result === "burn" ? "burned" : "sent to holder"}`,
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
    setTotalBurned(0);
    setTotalToHolders(0);
    setDevRewardsSol(0);
    toast({ title: "Reset complete" });
  };

  return (
    <div className="min-h-screen relative">
      <CasinoBackground />
      <CasinoResult result={currentResult} isVisible={showResult} />

      <div className="relative z-10">
        {/* Top bar */}
        <header className="border-b border-border/50 glass sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-400/20">
                <Coins className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <h1 className="font-display font-bold text-sm tracking-tight flex items-center gap-2">
                  COINFLIP
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold">BETA</span>
                </h1>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  Powered by <SolanaLogo className="w-3 h-3" /> Solana
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-border/50">
                <SolanaLogo className="w-4 h-4" />
                <span className="font-mono text-xs font-bold text-foreground">
                  {devRewardsSol.toFixed(3)}
                </span>
                <span className="text-[9px] text-muted-foreground font-medium">SOL</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/25">
                <div className="w-2 h-2 rounded-full bg-primary animate-live" />
                <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Live</span>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Rewards panel */}
          <section className="mb-10">
            <RewardsPanel 
              totalBurned={totalBurned}
              totalToHolders={totalToHolders}
              devRewardsSol={devRewardsSol}
              totalFlips={history.length}
            />
          </section>

          {/* Main game area */}
          <section className="grid lg:grid-cols-[280px_1fr_280px] gap-6 lg:gap-8 items-start mb-10">
            {/* Left - Timer */}
            <div className="flex justify-center lg:justify-end order-2 lg:order-1">
              <div className="w-full max-w-[260px]">
                <CasinoTimer
                  seconds={FLIP_INTERVAL}
                  onComplete={performFlip}
                  isRunning={isRunning && !isFlipping}
                />
              </div>
            </div>

            {/* Center - Coin & Controls */}
            <div className="flex flex-col items-center gap-10 order-1 lg:order-2 py-6">
              <CasinoCoin isFlipping={isFlipping} result={currentResult} />
              
              {/* Controls */}
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={performFlip}
                  disabled={isFlipping}
                  className={cn(
                    "min-w-[180px] h-13 px-8",
                    "bg-gradient-to-r from-primary via-[#0ea87a] to-primary bg-[length:200%_100%]",
                    "hover:bg-[position:100%_0] transition-all duration-500",
                    "text-primary-foreground font-bold text-sm rounded-xl",
                    "shadow-lg shadow-primary/30 hover:shadow-primary/50",
                    "border border-primary/20",
                    "disabled:opacity-50 disabled:hover:shadow-primary/30"
                  )}
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isFlipping ? "Flipping..." : "Flip Now"}
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleAutoFlip}
                    className={cn(
                      "w-12 h-12 rounded-xl glass border-border/50",
                      "hover:border-primary/30 hover:bg-primary/5 transition-all",
                      isRunning && "border-primary/30 bg-primary/5"
                    )}
                  >
                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetHistory}
                    className="w-12 h-12 rounded-xl glass border-border/50 hover:border-destructive/30 hover:bg-destructive/5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground/60 text-center max-w-[200px]">
                  Auto-flip every 2 minutes • 50/50 odds
                </p>
              </div>
            </div>

            {/* Right - Live Feed */}
            <div className="flex justify-center lg:justify-start order-3">
              <div className="w-full max-w-[280px]">
                <LiveFeed history={history} />
              </div>
            </div>
          </section>

          {/* Winners Panel */}
          <section className="mb-10">
            <WinnersPanel winners={winners} />
          </section>

          {/* How it works */}
          <section className="rounded-2xl overflow-hidden glass-premium p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center border border-border/50">
                <Info className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold">How It Works</span>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Flame,
                  title: "Buyback & Burn",
                  description: "Tokens bought from market and permanently burned, reducing supply.",
                  color: "ember",
                },
                {
                  icon: Gift,
                  title: "Random Holder",
                  description: "Lucky token holder randomly selected to receive the reward.",
                  color: "royal",
                },
                {
                  icon: Zap,
                  title: "Auto Flip",
                  description: "Automatic coin flip every 2 minutes, running 24/7 non-stop.",
                  color: "primary",
                },
              ].map((item) => (
                <div 
                  key={item.title}
                  className={cn(
                    "group flex gap-4 p-4 rounded-xl transition-all duration-300",
                    "bg-muted/20 border border-border/50",
                    `hover:border-${item.color}/30 hover:bg-${item.color}/5`
                  )}
                >
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                    `bg-${item.color}/10 border border-${item.color}/20`,
                    "group-hover:scale-110"
                  )}>
                    <item.icon className={`w-5 h-5 text-${item.color}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold text-${item.color} mb-1`}>{item.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center mt-12 pb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <SolanaLogo className="w-5 h-5" />
              <span className="text-xs text-muted-foreground font-medium">Built on Solana</span>
            </div>
            <p className="text-[10px] text-muted-foreground/50">
              50/50 odds • 2% dev fee • All transactions verifiable on Solscan
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Index;