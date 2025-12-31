import { useEffect, useState } from "react";

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
  isRunning: boolean;
}

const CountdownTimer = ({ seconds, onComplete, isRunning }: CountdownTimerProps) => {
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

  return (
    <div className="relative flex flex-col items-center gap-4">
      {/* Circular progress */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 56}`}
            strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
            className="transition-all duration-1000 ease-linear drop-shadow-[0_0_10px_hsl(160_100%_50%_/_0.5)]"
          />
        </svg>
        
        {/* Timer text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl font-bold text-foreground">
            {minutes}:{secs.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
        Next Flip
      </p>
    </div>
  );
};

export default CountdownTimer;
