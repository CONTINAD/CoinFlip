import { cn } from "@/lib/utils";

interface CasinoCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const CasinoCoin = ({ isFlipping, result }: CasinoCoinProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Coin container with 3D perspective */}
      <div 
        className="relative w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72"
        style={{ perspective: "1200px" }}
      >
        {/* Glow effect behind coin */}
        <div className={cn(
          "absolute inset-0 rounded-full blur-3xl transition-all duration-500",
          isFlipping && "animate-pulse",
          result === "burn" 
            ? "bg-ember/30" 
            : result === "holder" 
              ? "bg-royal/30"
              : "bg-gold/25"
        )} />

        {/* Expanding rings on flip */}
        {isFlipping && (
          <>
            <div className="absolute inset-0 rounded-full border-2 border-gold/60 animate-expand" />
            <div className="absolute inset-0 rounded-full border border-gold/40 animate-expand [animation-delay:0.2s]" />
            <div className="absolute inset-0 rounded-full border border-gold/20 animate-expand [animation-delay:0.4s]" />
          </>
        )}

        {/* Main coin */}
        <div
          className={cn(
            "absolute inset-0 rounded-full cursor-pointer transition-transform",
            isFlipping ? "animate-coin-flip" : "animate-coin-idle"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Coin edge (thickness) */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(180deg, #d4a017 0%, #8b6914 50%, #5c4a0f 100%)",
              transform: "translateZ(-4px)",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)"
            }}
          />

          {/* Coin front face */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #ffd93d 0%, #f5bc00 25%, #d4a017 50%, #b8860b 75%, #8b6914 100%)",
              boxShadow: `
                inset 0 2px 8px rgba(255,255,255,0.4),
                inset 0 -2px 8px rgba(0,0,0,0.3),
                0 20px 60px rgba(0,0,0,0.5),
                0 0 80px rgba(212,160,23,0.3)
              `,
              transform: "translateZ(4px)"
            }}
          >
            {/* Outer ring */}
            <div className="absolute inset-2 rounded-full border-4 border-amber-700/40" />
            
            {/* Inner raised area */}
            <div 
              className="absolute inset-4 rounded-full"
              style={{
                background: "linear-gradient(145deg, #ffe066 0%, #ffd93d 30%, #f5bc00 60%, #d4a017 100%)",
                boxShadow: "inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -2px 6px rgba(0,0,0,0.2)"
              }}
            >
              {/* Decorative inner ring */}
              <div className="absolute inset-3 rounded-full border-2 border-amber-600/30" />
              
              {/* Center symbol */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span 
                  className="font-display text-5xl md:text-6xl lg:text-7xl font-bold"
                  style={{
                    color: "#8b6914",
                    textShadow: "1px 1px 0 rgba(255,255,255,0.3), -1px -1px 0 rgba(0,0,0,0.2)"
                  }}
                >
                  $
                </span>
                <span 
                  className="font-display text-sm md:text-base font-semibold tracking-[0.2em] -mt-1"
                  style={{ color: "#8b6914" }}
                >
                  FLIP
                </span>
              </div>

              {/* Decorative dots */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-700/30"
                  style={{
                    top: `${50 + 38 * Math.sin((i * Math.PI * 2) / 8)}%`,
                    left: `${50 + 38 * Math.cos((i * Math.PI * 2) / 8)}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))}
            </div>

            {/* Shine effect */}
            <div 
              className="absolute inset-0 overflow-hidden rounded-full"
              style={{ transform: "translateZ(1px)" }}
            >
              <div 
                className={cn(
                  "absolute top-0 left-0 w-full h-full",
                  !isFlipping && "animate-shine"
                )}
                style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)",
                  width: "50%"
                }}
              />
            </div>

            {/* Top highlight */}
            <div 
              className="absolute top-0 left-1/4 right-1/4 h-1/4 rounded-full"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)"
              }}
            />
          </div>

          {/* Coin back face */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(145deg, #d4a017 0%, #b8860b 50%, #8b6914 100%)",
              transform: "translateZ(-4px) rotateY(180deg)",
              backfaceVisibility: "hidden"
            }}
          />
        </div>

        {/* Result glow ring */}
        {result && !isFlipping && (
          <div className={cn(
            "absolute -inset-4 rounded-full blur-xl animate-pulse-ring",
            result === "burn" 
              ? "bg-gradient-to-r from-ember/40 to-flame/40"
              : "bg-gradient-to-r from-royal/40 to-electric/40"
          )} />
        )}
      </div>

      {/* Shadow under coin */}
      <div 
        className="w-32 h-4 md:w-44 md:h-5 rounded-full bg-black/40 blur-md mt-6 animate-shadow-pulse"
        style={{ transform: "perspective(100px) rotateX(70deg)" }}
      />
    </div>
  );
};

export default CasinoCoin;
