import { useState, useCallback } from "react";
import Coin from "@/components/Coin";
import CountdownTimer from "@/components/CountdownTimer";
import FlipResult from "@/components/FlipResult";
import FlipHistory, { FlipRecord } from "@/components/FlipHistory";
import StatsPanel from "@/components/StatsPanel";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

      // Hide result after 3 seconds
      setTimeout(() => {
        setShowResult(false);
      }, 3000);
    }, 1500);
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_hsl(160_100%_50%_/_0.05)_0%,_transparent_70%)]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-3">
            <span className="text-glow-primary text-primary">COIN</span>{" "}
            <span className="text-accent">FLIP</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Every 2 minutes, fate decides: burn tokens or reward a holder
          </p>
        </header>

        {/* Main content */}
        <div className="flex flex-col items-center gap-8 md:gap-12">
          {/* Stats Panel */}
          <StatsPanel
            totalFlips={history.length}
            totalBurned={`${burnCount * 100}K`}
            holdersRewarded={holderCount}
          />

          {/* Coin and Timer section */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full">
            {/* Timer */}
            <div className="order-2 md:order-1">
              <CountdownTimer
                seconds={FLIP_INTERVAL}
                onComplete={performFlip}
                isRunning={isRunning && !isFlipping}
              />
            </div>

            {/* Coin */}
            <div className="relative order-1 md:order-2">
              <Coin isFlipping={isFlipping} result={currentResult} />
              <FlipResult result={currentResult} isVisible={showResult} />
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3 order-3">
              <Button
                onClick={handleManualFlip}
                disabled={isFlipping}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-semibold px-8 py-6 text-lg glow-primary"
              >
                {isFlipping ? "Flipping..." : "Flip Now"}
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAutoFlip}
                  className="border-border/50 hover:bg-muted"
                >
                  {isRunning ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetHistory}
                  className="border-border/50 hover:bg-muted"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* History */}
          <FlipHistory history={history} />

          {/* Info section */}
          <div className="w-full max-w-2xl text-center">
            <div className="gradient-border rounded-xl p-6 bg-card/30 backdrop-blur-sm">
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                How It Works
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <p className="font-semibold text-destructive mb-1">🔥 Buyback & Burn</p>
                  <p>Tokens are purchased from the market and permanently removed from circulation</p>
                </div>
                <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
                  <p className="font-semibold text-secondary mb-1">🎁 Random Holder</p>
                  <p>A randomly selected token holder receives the reward directly to their wallet</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
