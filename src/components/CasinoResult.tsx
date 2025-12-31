import { cn } from "@/lib/utils";
import { Flame, Gift, Sparkles, Trophy } from "lucide-react";

interface CasinoResultProps {
  result: "burn" | "holder" | null;
  isVisible: boolean;
}

const CasinoResult = ({ result, isVisible }: CasinoResultProps) => {
  if (!isVisible || !result) return null;

  const isBurn = result === "burn";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Result card */}
      <div className={cn(
        "relative animate-slide-up",
        "casino-card rounded-3xl px-12 py-10 border-2 max-w-md mx-4",
        isBurn 
          ? "border-ember/40 glow-ember" 
          : "border-royal/40 glow-purple"
      )}>
        {/* Top glow bar */}
        <div className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-b-full",
          isBurn 
            ? "bg-gradient-to-r from-transparent via-ember to-transparent"
            : "bg-gradient-to-r from-transparent via-royal to-transparent"
        )} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className={cn(
            "relative w-20 h-20 rounded-2xl flex items-center justify-center",
            isBurn 
              ? "bg-gradient-to-br from-ember/20 to-flame/10 border border-ember/30"
              : "bg-gradient-to-br from-royal/20 to-electric/10 border border-royal/30"
          )}>
            {/* Floating sparkles */}
            <Sparkles className={cn(
              "absolute w-5 h-5 -top-2 -right-2 animate-pulse",
              isBurn ? "text-ember/60" : "text-royal/60"
            )} />
            
            {isBurn ? (
              <Flame className="w-10 h-10 text-ember drop-shadow-lg" />
            ) : (
              <Trophy className="w-10 h-10 text-royal drop-shadow-lg" />
            )}
          </div>

          {/* Title */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
              Result
            </p>
            <h2 className={cn(
              "font-display text-3xl md:text-4xl font-bold tracking-wide",
              isBurn ? "text-gradient-ember" : "text-gradient-purple"
            )}>
              {isBurn ? "BUYBACK & BURN" : "RANDOM HOLDER"}
            </h2>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            {isBurn
              ? "Tokens purchased from the market will be permanently burned from circulation."
              : "A lucky holder has been randomly selected to receive the reward!"}
          </p>

          {/* Status badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
            isBurn 
              ? "bg-ember/10 text-ember border border-ember/20"
              : "bg-royal/10 text-royal border border-royal/20"
          )}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {isBurn ? "Burning in progress..." : "Reward sending..."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasinoResult;
