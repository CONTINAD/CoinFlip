import { cn } from "@/lib/utils";
import { Flame, Gift, Sparkles } from "lucide-react";

interface PremiumResultProps {
  result: "burn" | "holder" | null;
  isVisible: boolean;
}

const PremiumResult = ({ result, isVisible }: PremiumResultProps) => {
  if (!isVisible || !result) return null;

  const isBurn = result === "burn";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-300" />

      {/* Result card */}
      <div className={cn(
        "relative animate-reveal",
        "px-12 py-10 rounded-3xl",
        "glass-card border-2",
        isBurn 
          ? "border-ember/50 shadow-[0_0_80px_hsl(15_100%_55%_/_0.3)]" 
          : "border-royal/50 shadow-[0_0_80px_hsl(280_80%_55%_/_0.3)]"
      )}>
        {/* Glow background */}
        <div className={cn(
          "absolute -inset-4 rounded-3xl blur-2xl",
          isBurn 
            ? "bg-gradient-to-br from-ember/20 via-flame/10 to-transparent"
            : "bg-gradient-to-br from-royal/20 via-electric/10 to-transparent"
        )} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
          {/* Icon container */}
          <div className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center",
            isBurn 
              ? "bg-gradient-to-br from-ember/30 to-flame/20 glow-ember"
              : "bg-gradient-to-br from-royal/30 to-electric/20 glow-purple"
          )}>
            {/* Rotating sparkles */}
            <Sparkles className={cn(
              "absolute w-6 h-6 animate-spin [animation-duration:3s]",
              isBurn ? "text-ember/60" : "text-royal/60",
              "-top-2 -right-2"
            )} />
            <Sparkles className={cn(
              "absolute w-4 h-4 animate-spin [animation-duration:4s] [animation-direction:reverse]",
              isBurn ? "text-flame/60" : "text-electric/60",
              "-bottom-1 -left-1"
            )} />

            {/* Main icon */}
            {isBurn ? (
              <Flame className="w-12 h-12 text-ember drop-shadow-[0_0_15px_hsl(15_100%_55%_/_0.8)]" />
            ) : (
              <Gift className="w-12 h-12 text-royal drop-shadow-[0_0_15px_hsl(280_80%_55%_/_0.8)]" />
            )}
          </div>

          {/* Title */}
          <h2 className={cn(
            "font-display text-3xl md:text-4xl font-bold tracking-wide",
            isBurn ? "text-gradient-ember text-glow-ember" : "text-gradient-purple text-glow-purple"
          )}>
            {isBurn ? "BUYBACK & BURN" : "RANDOM HOLDER"}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground text-lg max-w-sm leading-relaxed">
            {isBurn
              ? "Tokens will be purchased and burned from circulation forever!"
              : "A lucky holder has been selected to receive the reward!"}
          </p>

          {/* Decorative line */}
          <div className={cn(
            "w-32 h-1 rounded-full",
            isBurn 
              ? "bg-gradient-to-r from-transparent via-ember to-transparent"
              : "bg-gradient-to-r from-transparent via-royal to-transparent"
          )} />
        </div>
      </div>
    </div>
  );
};

export default PremiumResult;
