import { useState, useCallback } from "react";
import { Play, Pause, RotateCcw, Zap, Flame, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CasinoBackground from "@/components/CasinoBackground";
import CasinoCoin from "@/components/CasinoCoin";
import CasinoTimer from "@/components/CasinoTimer";
import CasinoResult from "@/components/CasinoResult";
import CasinoStats from "@/components/CasinoStats";
import CasinoHistory, { FlipRecord } from "@/components/CasinoHistory";

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
    }, 2500);
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
      <CasinoBackground />
      
      {/* Result overlay */}
      <CasinoResult result={currentResult} isVisible={showResult} />

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <header className="text-center mb-8 md:mb-12">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-5">
            <div className="w-2 h-2 rounded-full bg-primary animate-live" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Live</span>
          </div>
          
          {/* Title */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-3 tracking-tight">
            <span className="text-gradient-gold">COIN</span>
            <span className="text-muted-foreground mx-2">×</span>
            <span className="text-foreground">FLIP</span>
          </h1>
          
          <p className="text-muted-foreground text-sm md:text-base max-w-md mx-auto">
            Every <span className="text-primary font-medium">2 minutes</span> — 
            <span className="text-ember"> burn tokens</span> or 
            <span className="text-royal"> reward a holder</span>
          </p>
        </header>

        {/* Stats */}
        <div className="flex justify-center mb-10 md:mb-14">
          <CasinoStats 
            totalFlips={history.length} 
            burnCount={burnCount}
            holderCount={holderCount}
          />
        </div>

        {/* Main game area */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 mb-10 md:mb-14">
          {/* Timer */}
          <div className="order-2 lg:order-1">
            <CasinoTimer
              seconds={FLIP_INTERVAL}
              onComplete={performFlip}
              isRunning={isRunning && !isFlipping}
            />
          </div>

          {/* Coin */}
          <div className="order-1 lg:order-2">
            <CasinoCoin isFlipping={isFlipping} result={currentResult} />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 order-3">
            <Button
              onClick={handleManualFlip}
              disabled={isFlipping}
              className="min-w-[160px] h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 hover:scale-[1.02] disabled:opacity-50"
            >
              <Zap className="w-5 h-5 mr-2" />
              {isFlipping ? "Flipping..." : "Flip Now"}
            </Button>
            
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="icon"
                onClick={toggleAutoFlip}
                className="w-12 h-12 rounded-xl border-border bg-secondary hover:bg-secondary/80"
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={resetHistory}
                className="w-12 h-12 rounded-xl border-border bg-secondary hover:bg-secondary/80"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="flex justify-center mb-12">
          <CasinoHistory history={history} />
        </div>

        {/* How it works */}
        <div className="max-w-2xl mx-auto">
          <div className="casino-card rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-center mb-5 text-foreground">
              How It Works
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex gap-4 p-4 rounded-xl bg-ember/5 border border-ember/10">
                <div className="w-10 h-10 rounded-lg bg-ember/15 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h4 className="font-semibold text-ember text-sm mb-1">Buyback & Burn</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tokens are purchased and permanently removed from circulation.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 p-4 rounded-xl bg-royal/5 border border-royal/10">
                <div className="w-10 h-10 rounded-lg bg-royal/15 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-royal" />
                </div>
                <div>
                  <h4 className="font-semibold text-royal text-sm mb-1">Random Holder</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A lucky token holder is randomly selected to receive the reward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-6">
          <p className="text-xs text-muted-foreground">
            50/50 fair odds • Provably random
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
