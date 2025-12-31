import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PremiumTimerProps {
  seconds: number;
  onComplete: () => void;
  isRunning: boolean;
}

const PremiumTimer = ({ seconds, onComplete, isRunning }: PremiumTimerProps) => {
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
  const progress = (seconds - timeLeft) / seconds;
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference * (1 - progress);

  const isLowTime = timeLeft <= 10;

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Timer container */}
      <div className={cn(
        "relative w-44 h-44",
        isLowTime && "animate-countdown-pulse"
      )}>
        {/* Outer glow */}
        <div className={cn(
          "absolute -inset-4 rounded-full blur-xl transition-all duration-300",
          isLowTime 
            ? "bg-ember/20" 
            : "bg-primary/10"
        )} />

        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="88"
            cy="88"
            r="70"
            fill="none"
            stroke="hsl(240 10% 15%)"
            strokeWidth="6"
          />
          {/* Track glow */}
          <circle
            cx="88"
            cy="88"
            r="70"
            fill="none"
            stroke="hsl(240 10% 20%)"
            strokeWidth="2"
            className="opacity-50"
          />
        </svg>

        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isLowTime ? "hsl(15 100% 55%)" : "hsl(45 100% 55%)"} />
              <stop offset="100%" stopColor={isLowTime ? "hsl(0 100% 50%)" : "hsl(35 100% 50%)"} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="88"
            cy="88"
            r="70"
            fill="none"
            stroke="url(#timerGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
            filter="url(#glow)"
          />
        </svg>

        {/* Inner decorative ring */}
        <div className="absolute inset-6 rounded-full border border-border/30" />

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(
            "font-display text-4xl font-bold tracking-wider transition-colors duration-300",
            isLowTime ? "text-ember text-glow-ember" : "text-gradient-gold"
          )}>
            {minutes}:{secs.toString().padStart(2, "0")}
          </span>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 border-t-2 border-primary/50 rounded-t-sm" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 border-b-2 border-primary/50 rounded-b-sm" />
      </div>

      {/* Label */}
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2 h-2 rounded-full transition-colors",
          isRunning ? "bg-accent animate-pulse" : "bg-muted-foreground"
        )} />
        <p className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
          {isRunning ? "Next Flip" : "Paused"}
        </p>
      </div>
    </div>
  );
};

export default PremiumTimer;
