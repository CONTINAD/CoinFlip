import { cn } from "@/lib/utils";
import { Flame, Gift } from "lucide-react";

interface FlipResultProps {
  result: "burn" | "holder" | null;
  isVisible: boolean;
}

const FlipResult = ({ result, isVisible }: FlipResultProps) => {
  if (!isVisible || !result) return null;

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-center z-20",
        "animate-in fade-in zoom-in duration-500"
      )}
    >
      <div
        className={cn(
          "px-8 py-6 rounded-2xl backdrop-blur-xl border",
          "flex flex-col items-center gap-3 text-center",
          result === "burn"
            ? "bg-destructive/20 border-destructive/50 shadow-[0_0_40px_hsl(0_85%_55%_/_0.3)]"
            : "bg-secondary/20 border-secondary/50 shadow-[0_0_40px_hsl(280_100%_60%_/_0.3)]"
        )}
      >
        <div
          className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center",
            result === "burn" ? "bg-destructive/30" : "bg-secondary/30"
          )}
        >
          {result === "burn" ? (
            <Flame className="w-8 h-8 text-destructive" />
          ) : (
            <Gift className="w-8 h-8 text-secondary" />
          )}
        </div>
        
        <h3 className="font-display text-2xl font-bold">
          {result === "burn" ? (
            <span className="text-destructive text-glow-primary">BUYBACK & BURN</span>
          ) : (
            <span className="text-secondary text-glow-secondary">RANDOM HOLDER</span>
          )}
        </h3>
        
        <p className="text-sm text-muted-foreground max-w-xs">
          {result === "burn"
            ? "Tokens will be bought back and burned forever!"
            : "A lucky holder will receive the reward!"}
        </p>
      </div>
    </div>
  );
};

export default FlipResult;
