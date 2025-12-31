import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Clock, Zap } from "lucide-react";

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
  const isLowTime = timeLeft <= 20;
  const isCritical = timeLeft <= 10;

  // Calculate circle progress
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn(
      "relative rounded-2xl overflow-hidden transition-all duration-500",
      "glass-premium",
      isCritical && "glow-green"
    )}>
      {/* Background pulse for critical time */}
      {isCritical && (
        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
      )}

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              isCritical ? "bg-primary/20" : "bg-muted/50"
            )}>
              <Clock className={cn(
                "w-3.5 h-3.5 transition-colors",
                isCritical ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
              Next Flip
            </span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all",
            isRunning ? "bg-primary/10 border border-primary/20" : "bg-muted/30 border border-border"
          )}>
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              isRunning ? "bg-primary animate-live" : "bg-muted-foreground"
            )} />
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-wider",
              isRunning ? "text-primary" : "text-muted-foreground"
            )}>
              {isRunning ? "AUTO" : "PAUSED"}
            </span>
          </div>
        </div>

        {/* Circular timer */}
        <div className="relative flex justify-center mb-5">
          <div className="relative w-32 h-32">
            {/* Background circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="hsl(228 18% 15%)"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={isCritical ? "url(#timerGradient)" : isLowTime ? "hsl(160 84% 39%)" : "hsl(228 15% 25%)"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
                style={{
                  filter: isCritical ? "drop-shadow(0 0 8px hsl(160 84% 39% / 0.6))" : "none"
                }}
              />
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14F195" />
                  <stop offset="100%" stopColor="#9945FF" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={cn(
                "font-mono text-3xl font-bold tracking-tight transition-all duration-300",
                isCritical 
                  ? "text-primary text-glow-green animate-timer-urgent" 
                  : isLowTime 
                    ? "text-primary" 
                    : "text-foreground"
              )}>
                <span>{minutes}</span>
                <span className={cn("mx-0.5", isCritical && "animate-pulse")}>:</span>
                <span>{secs.toString().padStart(2, "0")}</span>
              </div>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">
                until flip
              </span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className={cn(
          "flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all",
          isCritical ? "bg-primary/10 border border-primary/20" : "bg-muted/30 border border-border/50"
        )}>
          <Zap className={cn(
            "w-3 h-3",
            isCritical ? "text-primary" : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-[10px] font-semibold",
            isCritical ? "text-primary" : "text-muted-foreground"
          )}>
            {isCritical ? "Flipping soon!" : isRunning ? "Auto-flip active" : "Paused"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CasinoTimer;