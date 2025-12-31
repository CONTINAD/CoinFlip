import { cn } from "@/lib/utils";

interface CoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const Coin = ({ isFlipping, result }: CoinProps) => {
  return (
    <div className="relative w-48 h-48 md:w-64 md:h-64 perspective-1000">
      {/* Glow rings */}
      <div className={cn(
        "absolute inset-0 rounded-full opacity-30",
        result === "burn" ? "bg-destructive" : result === "holder" ? "bg-secondary" : "bg-primary",
        isFlipping && "animate-pulse-ring"
      )} />
      <div className={cn(
        "absolute inset-4 rounded-full opacity-20",
        result === "burn" ? "bg-destructive" : result === "holder" ? "bg-secondary" : "bg-primary",
        isFlipping && "animate-pulse-ring [animation-delay:0.3s]"
      )} />
      
      {/* Coin */}
      <div
        className={cn(
          "absolute inset-0 rounded-full flex items-center justify-center transition-all duration-300",
          "bg-gradient-to-br from-accent via-amber-400 to-amber-600",
          "shadow-[0_0_60px_rgba(234,179,8,0.4),inset_0_2px_10px_rgba(255,255,255,0.3)]",
          isFlipping && "animate-flip",
          !isFlipping && "animate-float"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Inner coin design */}
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 flex items-center justify-center border-4 border-amber-600/50">
          <div className="text-center">
            <span className="font-display text-3xl md:text-4xl font-bold text-amber-900 drop-shadow-lg">
              $
            </span>
            <p className="font-display text-xs md:text-sm text-amber-800 mt-1 tracking-wider">
              FLIP
            </p>
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default Coin;
