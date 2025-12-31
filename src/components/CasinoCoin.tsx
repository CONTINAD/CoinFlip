import { cn } from "@/lib/utils";

interface CasinoCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const CasinoCoin = ({ isFlipping, result }: CasinoCoinProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring */}
      <div className={cn(
        "absolute -inset-12 rounded-full transition-all duration-1000 blur-[80px]",
        isFlipping && "animate-pulse scale-110",
        result === "burn" 
          ? "bg-gradient-to-br from-ember via-flame to-ember/50" 
          : result === "holder" 
            ? "bg-gradient-to-br from-royal via-[#9945FF] to-royal/50"
            : "bg-gradient-to-br from-amber-400/30 via-amber-500/20 to-amber-600/10"
      )} style={{ opacity: result ? 0.5 : 0.3 }} />

      {/* Coin container */}
      <div 
        className="relative w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64"
        style={{ perspective: "1200px" }}
      >
        {/* Particle effects when flipping */}
        {isFlipping && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-amber-400/70 animate-expand" />
            <div className="absolute inset-0 rounded-full border border-amber-400/50 animate-expand [animation-delay:0.15s]" />
            <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-expand [animation-delay:0.3s]" />
            <div className="absolute inset-0 rounded-full border border-amber-400/20 animate-expand [animation-delay:0.45s]" />
          </>
        )}

        {/* Main coin */}
        <div
          className={cn(
            "absolute inset-0 rounded-full cursor-pointer",
            isFlipping ? "animate-coin-flip" : "animate-coin-idle"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Edge (thickness) - enhanced */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(180deg, #d4af37 0%, #b8860b 25%, #8b6914 50%, #654d0e 75%, #4a3810 100%)",
              transform: "translateZ(-8px)",
              boxShadow: "inset 0 0 50px rgba(0,0,0,0.7), inset 0 20px 30px rgba(255,255,255,0.05)"
            }}
          />

          {/* Front face - more detailed */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: "conic-gradient(from 135deg, #ffd700 0%, #fff8dc 8%, #ffd700 15%, #daa520 30%, #b8860b 45%, #cd9b1d 55%, #ffd700 70%, #ffec8b 80%, #ffd700 90%, #daa520 100%)",
              boxShadow: `
                inset 0 6px 20px rgba(255,255,255,0.5),
                inset 0 -6px 20px rgba(0,0,0,0.4),
                0 25px 70px rgba(0,0,0,0.6),
                0 0 100px rgba(255,215,0,0.35)
              `,
              transform: "translateZ(8px)"
            }}
          >
            {/* Outer ring details */}
            <div className="absolute inset-[4%] rounded-full border-[4px] border-amber-900/30" />
            <div className="absolute inset-[6%] rounded-full border-[2px] border-amber-900/20" />
            <div className="absolute inset-[9%] rounded-full border border-amber-800/15" />
            
            {/* Inner raised area with better gradient */}
            <div 
              className="absolute inset-[11%] rounded-full"
              style={{
                background: "radial-gradient(ellipse at 35% 25%, #fffacd 0%, #ffd700 15%, #eec900 30%, #daa520 50%, #b8860b 75%, #8b6914 100%)",
                boxShadow: "inset 0 6px 18px rgba(255,255,255,0.6), inset 0 -6px 15px rgba(0,0,0,0.3)"
              }}
            >
              {/* Inner rings */}
              <div className="absolute inset-[6%] rounded-full border-2 border-amber-800/25" />
              <div className="absolute inset-[10%] rounded-full border border-amber-800/15" />
              
              {/* Center content */}
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-0.5">
                <span 
                  className="text-6xl md:text-7xl lg:text-8xl font-black leading-none"
                  style={{
                    color: "#8b6914",
                    textShadow: "3px 3px 0 rgba(255,255,255,0.35), -1px -1px 0 rgba(0,0,0,0.25)",
                    fontFamily: "'Space Grotesk', sans-serif"
                  }}
                >
                  $
                </span>
                <span 
                  className="text-[8px] md:text-[10px] lg:text-xs font-bold tracking-[0.35em] uppercase"
                  style={{ 
                    color: "#8b6914",
                    textShadow: "1px 1px 0 rgba(255,255,255,0.2)"
                  }}
                >
                  FLIP
                </span>
              </div>

              {/* Edge notches */}
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-amber-900/20"
                  style={{
                    top: `${50 + 44 * Math.sin((i * Math.PI * 2) / 16)}%`,
                    left: `${50 + 44 * Math.cos((i * Math.PI * 2) / 16)}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))}
            </div>

            {/* Sweeping shine */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div 
                className={cn("absolute top-0 left-0 h-full", !isFlipping && "animate-shine")}
                style={{
                  background: "linear-gradient(105deg, transparent 25%, rgba(255,255,255,0.5) 50%, transparent 75%)",
                  width: "50%"
                }}
              />
            </div>

            {/* Top highlight glare */}
            <div 
              className="absolute top-[3%] left-[15%] right-[15%] h-[22%] rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)"
              }}
            />

            {/* Bottom subtle reflection */}
            <div 
              className="absolute bottom-[8%] left-[25%] right-[25%] h-[8%] rounded-full"
              style={{
                background: "linear-gradient(0deg, rgba(255,255,255,0.1) 0%, transparent 100%)"
              }}
            />
          </div>
        </div>

        {/* Result glow overlay */}
        {result && !isFlipping && (
          <div className={cn(
            "absolute -inset-6 rounded-full blur-3xl animate-pulse-ring pointer-events-none",
            result === "burn" 
              ? "bg-gradient-to-br from-ember/50 via-flame/40 to-ember/30"
              : "bg-gradient-to-br from-royal/50 via-[#9945FF]/40 to-royal/30"
          )} />
        )}
      </div>

      {/* Ground shadow */}
      <div 
        className="w-28 h-4 md:w-36 md:h-5 rounded-[50%] bg-black/50 blur-xl mt-8 animate-shadow-pulse"
      />
      
      {/* Status indicator */}
      <div className={cn(
        "mt-6 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-500",
        isFlipping 
          ? "bg-primary/20 text-primary border border-primary/30"
          : result === "burn"
            ? "bg-ember/15 text-ember border border-ember/25"
            : result === "holder"
              ? "bg-royal/15 text-royal border border-royal/25"
              : "bg-muted/50 text-muted-foreground border border-border"
      )}>
        {isFlipping ? "Flipping..." : result === "burn" ? "Burned!" : result === "holder" ? "Winner!" : "Ready"}
      </div>
    </div>
  );
};

export default CasinoCoin;