import { cn } from "@/lib/utils";

interface CasinoCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const CasinoCoin = ({ isFlipping, result }: CasinoCoinProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Coin container */}
      <div 
        className="relative w-44 h-44 md:w-56 md:h-56 lg:w-64 lg:h-64"
        style={{ perspective: "1000px" }}
      >
        {/* Ambient glow */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-3xl transition-all duration-700",
          isFlipping && "animate-pulse scale-110",
          result === "burn" 
            ? "bg-ember/25" 
            : result === "holder" 
              ? "bg-royal/25"
              : "bg-gold/20"
        )} />

        {/* Flip rings */}
        {isFlipping && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-gold/50 animate-expand" />
            <div className="absolute inset-0 rounded-full border border-gold/30 animate-expand [animation-delay:0.15s]" />
            <div className="absolute inset-0 rounded-full border border-gold/15 animate-expand [animation-delay:0.3s]" />
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
          {/* Edge */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(180deg, #c9a227 0%, #8b6914 50%, #5a4510 100%)",
              transform: "translateZ(-5px)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.5)"
            }}
          />

          {/* Front face */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: "conic-gradient(from 135deg, #ffd700 0%, #f0c420 15%, #daa520 30%, #cd9b1d 45%, #b8860b 60%, #cd9b1d 75%, #daa520 90%, #ffd700 100%)",
              boxShadow: `
                inset 0 3px 12px rgba(255,255,255,0.35),
                inset 0 -3px 12px rgba(0,0,0,0.25),
                0 15px 50px rgba(0,0,0,0.45),
                0 0 60px rgba(218,165,32,0.25)
              `,
              transform: "translateZ(5px)"
            }}
          >
            {/* Outer ring */}
            <div className="absolute inset-[6%] rounded-full border-[3px] border-amber-800/35" />
            
            {/* Inner raised area */}
            <div 
              className="absolute inset-[10%] rounded-full"
              style={{
                background: "radial-gradient(ellipse at 35% 25%, #ffe566 0%, #ffd700 25%, #daa520 55%, #b8860b 100%)",
                boxShadow: "inset 0 3px 10px rgba(255,255,255,0.45), inset 0 -3px 10px rgba(0,0,0,0.2)"
              }}
            >
              {/* Inner ring */}
              <div className="absolute inset-[10%] rounded-full border-2 border-amber-700/25" />
              
              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span 
                  className="text-5xl md:text-6xl lg:text-7xl font-black"
                  style={{
                    color: "#8b6914",
                    textShadow: "2px 2px 0 rgba(255,255,255,0.25), -1px -1px 0 rgba(0,0,0,0.15)",
                    fontFamily: "Inter, sans-serif"
                  }}
                >
                  $
                </span>
                <span 
                  className="text-[10px] md:text-xs font-bold tracking-[0.25em] -mt-1 uppercase"
                  style={{ color: "#8b6914" }}
                >
                  FLIP
                </span>
              </div>

              {/* Edge dots */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-amber-800/25"
                  style={{
                    top: `${50 + 40 * Math.sin((i * Math.PI * 2) / 12)}%`,
                    left: `${50 + 40 * Math.cos((i * Math.PI * 2) / 12)}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))}
            </div>

            {/* Shine */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div 
                className={cn("absolute top-0 left-0 h-full", !isFlipping && "animate-shine")}
                style={{
                  background: "linear-gradient(100deg, transparent 35%, rgba(255,255,255,0.35) 50%, transparent 65%)",
                  width: "40%"
                }}
              />
            </div>

            {/* Top glare */}
            <div 
              className="absolute top-[5%] left-[20%] right-[20%] h-[22%] rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, transparent 100%)"
              }}
            />
          </div>
        </div>

        {/* Result glow */}
        {result && !isFlipping && (
          <div className={cn(
            "absolute -inset-3 rounded-full blur-2xl animate-pulse-ring",
            result === "burn" 
              ? "bg-gradient-radial from-ember/35 to-transparent"
              : "bg-gradient-radial from-royal/35 to-transparent"
          )} />
        )}
      </div>

      {/* Shadow */}
      <div 
        className="w-28 h-3 md:w-36 md:h-4 rounded-[50%] bg-black/35 blur-md mt-5 animate-shadow-pulse"
      />
    </div>
  );
};

export default CasinoCoin;
