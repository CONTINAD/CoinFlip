import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

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
  const isLowTime = timeLeft <= 10;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Timer card */}
      <div className={cn(
        "casino-card rounded-2xl px-8 py-6 flex flex-col items-center gap-4 transition-all duration-300",
        isLowTime && "casino-card-green glow-green"
      )}>
        {/* Header */}
        <div className="flex items-center gap-2">
          <Clock className={cn(
            "w-4 h-4 transition-colors",
            isLowTime ? "text-primary" : "text-muted-foreground"
          )} />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Next Flip
          </span>
        </div>

        {/* Time display */}
        <div className={cn(
          "font-display text-5xl md:text-6xl font-bold tracking-wider transition-all duration-300",
          isLowTime ? "text-primary text-glow-green" : "text-foreground"
        )}>
          {minutes}:{secs.toString().padStart(2, "0")}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              isLowTime 
                ? "bg-gradient-to-r from-primary via-primary to-neon" 
                : "bg-gradient-to-r from-muted-foreground/50 to-muted-foreground"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full transition-colors",
            isRunning ? "bg-primary animate-live" : "bg-muted-foreground"
          )} />
          <span className="text-xs text-muted-foreground">
            {isRunning ? "Auto-flip active" : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CasinoTimer;
