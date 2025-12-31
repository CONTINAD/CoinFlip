import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CasinoTimerProps {
  seconds: number;
  onComplete: () => void;
  isRunning: boolean;
}

const CasinoTimer = ({ seconds, onComplete, isRunning }: CasinoTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onComplete();
          return seconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, seconds, onComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((seconds - timeLeft) / seconds) * 100;
  const isLowTime = timeLeft <= 15;
  const isCritical = timeLeft <= 5;

  return (
    <div className={cn(
      "stake-card rounded-2xl p-5 transition-all duration-500",
      isLowTime && "stake-card-highlight",
      isCritical && "glow-green"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
          Next Flip
        </span>
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            isRunning ? "bg-primary animate-live" : "bg-muted-foreground"
          )} />
          <span className="text-[10px] text-muted-foreground">
            {isRunning ? "AUTO" : "PAUSED"}
          </span>
        </div>
      </div>

      {/* Time */}
      <div className={cn(
        "font-mono text-4xl md:text-5xl font-semibold tracking-tight text-center mb-4 transition-all duration-300",
        isCritical ? "text-primary text-glow-green" : isLowTime ? "text-primary" : "text-foreground"
      )}>
        {minutes}:{secs.toString().padStart(2, "0")}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-linear",
            isCritical 
              ? "bg-primary shadow-[0_0_10px_hsl(145_80%_42%_/_0.5)]" 
              : isLowTime 
                ? "bg-primary/80" 
                : "bg-muted-foreground/40"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default CasinoTimer;
