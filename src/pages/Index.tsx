import { useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BackgroundEffects from "@/components/BackgroundEffects";
import PremiumCoin from "@/components/PremiumCoin";
import PremiumTimer from "@/components/PremiumTimer";
import PremiumResult from "@/components/PremiumResult";
import PremiumStats from "@/components/PremiumStats";
import PremiumHistory, { FlipRecord } from "@/components/PremiumHistory";

const FLIP_INTERVAL = 120; // 2 minutes in seconds

const Index = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);
  const [currentResult, setCurrentResult] = useState<"burn" | "holder" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<FlipRecord[]>([]);
  const { toast } = useToast();

  const performFlip = useCallback(() => {
    if (isFlipping) return;

    setIsFlipping(true);
    setShowResult(false);
    setCurrentResult(null);

    // Simulate flip animation duration
    setTimeout(() => {
      const result = Math.random() > 0.5 ? "burn" : "holder";
      setCurrentResult(result);
      setIsFlipping(false);
      setShowResult(true);

      // Add to history
      setHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          result,
          timestamp: new Date(),
        },
      ]);

      toast({
        title: result === "burn" ? "🔥 Buyback & Burn!" : "🎁 Random Holder Wins!",
        description: result === "burn" 
          ? "Tokens will be burned from supply" 
          : "A lucky holder receives the reward",
      });

      // Hide result after 4 seconds
      setTimeout(() => {
        setShowResult(false);
      }, 4000);
    }, 2000);
  }, [isFlipping, toast]);

  const handleManualFlip = () => {
    performFlip();
  };

  const toggleAutoFlip = () => {
    setIsRunning((prev) => !prev);
    toast({
      title: isRunning ? "Auto-flip paused" : "Auto-flip resumed",
      description: isRunning 
        ? "Click play to resume automatic flipping" 
        : "Coin will flip every 2 minutes",
    });
  };

  const resetHistory = () => {
    setHistory([]);
    toast({
      title: "History cleared",
      description: "All flip records have been reset",
    });
  };

  const burnCount = history.filter((h) => h.result === "burn").length;
  const holderCount = history.filter((h) => h.result === "holder").length;

  return (
    <div className="min-h-screen relative">
      <BackgroundEffects />
      
      {/* Result overlay */}
      <PremiumResult result={currentResult} isVisible={showResult} />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-primary tracking-wide">LIVE</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tight">
            <span className="text-gradient-gold text-glow-gold">COIN</span>
            <span className="text-foreground mx-3">×</span>
            <span className="text-gradient-ember">FLIP</span>
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            Every <span className="text-primary font-semibold">2 minutes</span>, fate decides: 
            <span className="text-ember"> burn tokens</span> or 
            <span className="text-royal"> reward a holder</span>
          </p>
        </header>

        {/* Stats */}
        <div className="flex justify-center mb-12 md:mb-16">
          <PremiumStats 
            totalFlips={history.length} 
            burnCount={burnCount}
            holderCount={holderCount}
          />
        </div>

        {/* Main game area */}
        <div className="flex flex-col items-center gap-12 md:gap-16 mb-12 md:mb-16">
          {/* Coin and controls row */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 w-full">
            {/* Timer */}
            <div className="order-2 lg:order-1">
              <PremiumTimer
                seconds={FLIP_INTERVAL}
                onComplete={performFlip}
                isRunning={isRunning && !isFlipping}
              />
            </div>

            {/* Coin */}
            <div className="order-1 lg:order-2">
              <PremiumCoin isFlipping={isFlipping} result={currentResult} />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 order-3">
              <Button
                variant="premium"
                size="xl"
                onClick={handleManualFlip}
                disabled={isFlipping}
                className="min-w-[180px]"
              >
                <Zap className="w-5 h-5" />
                {isFlipping ? "Flipping..." : "Flip Now"}
              </Button>
              
              <div className="flex gap-3 justify-center">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={toggleAutoFlip}
                >
                  {isRunning ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                
                <Button
                  variant="glass"
                  size="icon"
                  onClick={resetHistory}
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>

              {/* Status indicator */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Auto-flip: <span className={isRunning ? "text-accent" : "text-muted-foreground"}>{isRunning ? "Active" : "Paused"}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="flex justify-center mb-12">
          <PremiumHistory history={history} />
        </div>

        {/* How it works */}
        <div className="max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 border border-border/50">
            <h3 className="font-display text-xl font-bold text-center mb-6 text-gradient-gold">
              How It Works
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative group p-5 rounded-xl bg-ember/5 border border-ember/20 hover:border-ember/40 transition-all duration-300">
                <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-ember/20 to-flame/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-ember/20 flex items-center justify-center">
                      <span className="text-xl">🔥</span>
                    </div>
                    <h4 className="font-display font-bold text-ember">Buyback & Burn</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Tokens are purchased from the market and permanently removed from circulation, reducing supply.
                  </p>
                </div>
              </div>
              
              <div className="relative group p-5 rounded-xl bg-royal/5 border border-royal/20 hover:border-royal/40 transition-all duration-300">
                <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-royal/20 to-electric/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-royal/20 flex items-center justify-center">
                      <span className="text-xl">🎁</span>
                    </div>
                    <h4 className="font-display font-bold text-royal">Random Holder</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A randomly selected token holder receives the reward directly to their wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pb-8">
          <p className="text-sm text-muted-foreground">
            Built with <span className="text-primary">♦</span> for the community
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
