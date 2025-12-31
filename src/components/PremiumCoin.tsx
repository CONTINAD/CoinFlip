import { cn } from "@/lib/utils";

interface PremiumCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const PremiumCoin = ({ isFlipping, result }: PremiumCoinProps) => {
  return (
    <div className="relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80" style={{ perspective: "1000px" }}>
      {/* Outer glow rings */}
      <div className={cn(
        "absolute -inset-8 rounded-full transition-all duration-500",
        result === "burn" 
          ? "bg-gradient-to-r from-ember/20 via-flame/10 to-ember/20" 
          : result === "holder" 
            ? "bg-gradient-to-r from-royal/20 via-electric/10 to-royal/20"
            : "bg-gradient-to-r from-primary/20 via-gold-light/10 to-primary/20",
        "blur-2xl",
        isFlipping && "animate-pulse"
      )} />

      {/* Expanding ring effects */}
      {isFlipping && (
        <>
          <div className="absolute inset-0 rounded-full border-2 border-primary/60 animate-expand-ring" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-expand-ring [animation-delay:0.3s]" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-expand-ring [animation-delay:0.6s]" />
        </>
      )}

      {/* Main coin container */}
      <div
        className={cn(
          "absolute inset-0 rounded-full transition-all duration-300",
          isFlipping ? "animate-flip-premium" : "animate-float-premium"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Coin outer rim */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 shadow-[0_0_60px_rgba(245,158,11,0.4),0_20px_40px_rgba(0,0,0,0.5)]">
          {/* Rim edge detail */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-b from-amber-400 via-yellow-400 to-amber-600">
            {/* Inner rim */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-600 shadow-[inset_0_4px_20px_rgba(255,255,255,0.4),inset_0_-4px_20px_rgba(0,0,0,0.2)]">
              {/* Coin face */}
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-500 flex items-center justify-center overflow-hidden">
                {/* Inner decorative ring */}
                <div className="absolute inset-4 rounded-full border-4 border-amber-600/30" />
                <div className="absolute inset-6 rounded-full border-2 border-amber-700/20" />

                {/* Center design */}
                <div className="relative z-10 text-center">
                  <div className="relative">
                    <span className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-amber-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                      $
                    </span>
                    {/* Dollar sign shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-50" />
                  </div>
                  <p className="font-display text-xs md:text-sm font-bold text-amber-800 tracking-[0.3em] mt-1 uppercase">
                    Flip
                  </p>
                </div>

                {/* Decorative dots around edge */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-amber-700/30"
                    style={{
                      top: `${50 + 42 * Math.sin((i * Math.PI * 2) / 12)}%`,
                      left: `${50 + 42 * Math.cos((i * Math.PI * 2) / 12)}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                ))}

                {/* Top shine reflection */}
                <div className="absolute top-0 left-1/4 right-1/4 h-1/3 bg-gradient-to-b from-white/40 via-white/10 to-transparent rounded-t-full" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* 3D edge simulation */}
        <div className="absolute inset-0 rounded-full" style={{ transform: "translateZ(-4px)" }}>
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-600 to-amber-800" />
        </div>
      </div>

      {/* Result glow effect */}
      {result && !isFlipping && (
        <div className={cn(
          "absolute -inset-4 rounded-full transition-all duration-500 animate-pulse-ring",
          result === "burn" 
            ? "bg-gradient-to-r from-ember/30 to-flame/30 blur-xl"
            : "bg-gradient-to-r from-royal/30 to-electric/30 blur-xl"
        )} />
      )}
    </div>
  );
};

export default PremiumCoin;
