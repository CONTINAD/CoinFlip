import { cn } from "@/lib/utils";

interface CasinoCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const CasinoCoin = ({ isFlipping, result }: CasinoCoinProps) => {
  return (
    <div className="relative flex flex-col items-center">
      {/* Ambient glow */}
      <div className={cn(
        "absolute w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full transition-all duration-700 blur-[100px]",
        isFlipping && "animate-pulse scale-110",
        result === "burn" 
          ? "bg-gradient-radial from-ember/50 to-transparent" 
          : result === "holder" 
            ? "bg-gradient-radial from-royal/50 to-transparent"
            : "bg-gradient-radial from-amber-500/30 to-transparent"
      )} />

      {/* Coin container */}
      <div 
        className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72"
        style={{ perspective: "800px" }}
      >
        {/* Particle rings when flipping */}
        {isFlipping && (
          <>
            <div className="absolute inset-[-10%] rounded-full border-2 border-amber-400/60 animate-expand" />
            <div className="absolute inset-[-5%] rounded-full border border-amber-300/40 animate-expand [animation-delay:0.2s]" />
            <div className="absolute inset-0 rounded-full border border-amber-400/30 animate-expand [animation-delay:0.4s]" />
          </>
        )}

        {/* Main coin wrapper */}
        <div
          className={cn(
            "absolute inset-0 cursor-pointer",
            isFlipping ? "animate-coin-flip" : "animate-coin-idle"
          )}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Coin edge/rim - multiple layers for depth */}
          <div 
            className="absolute inset-[2%] rounded-full"
            style={{
              background: "linear-gradient(160deg, #a07c1c 0%, #6b5210 30%, #3d2e08 60%, #6b5210 100%)",
              transform: "translateZ(-14px)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.9), inset 0 -10px 30px rgba(0,0,0,0.5)"
            }}
          />
          <div 
            className="absolute inset-[2%] rounded-full"
            style={{
              background: "linear-gradient(160deg, #c9a227 0%, #8b6914 40%, #5a4510 80%, #8b6914 100%)",
              transform: "translateZ(-10px)",
              boxShadow: "inset 0 0 30px rgba(0,0,0,0.7)"
            }}
          />
          <div 
            className="absolute inset-[2%] rounded-full"
            style={{
              background: "linear-gradient(160deg, #d4af37 0%, #a07c1c 50%, #6b5210 100%)",
              transform: "translateZ(-6px)",
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
            }}
          />

          {/* Coin face - front */}
          <div 
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 30% 20%, rgba(255,250,205,0.9) 0%, transparent 35%),
                radial-gradient(ellipse 60% 40% at 70% 80%, rgba(139,105,20,0.6) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, #ffd700 0%, #eec900 25%, #daa520 45%, #b8860b 65%, #8b6914 85%, #6b5210 100%)
              `,
              boxShadow: `
                inset 0 10px 40px rgba(255,255,255,0.6),
                inset 0 -10px 40px rgba(0,0,0,0.5),
                inset 5px 0 30px rgba(255,255,255,0.2),
                inset -5px 0 30px rgba(0,0,0,0.3),
                0 40px 80px -20px rgba(0,0,0,0.6),
                0 0 100px rgba(255,215,0,0.4)
              `,
              transform: "translateZ(14px)"
            }}
          >
            {/* Outer beveled ring */}
            <div 
              className="absolute inset-[3%] rounded-full"
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.3) 100%)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.4)"
              }}
            />

            {/* Inner recessed area */}
            <div 
              className="absolute inset-[8%] rounded-full"
              style={{
                background: `
                  radial-gradient(ellipse 70% 45% at 35% 25%, rgba(255,250,205,0.8) 0%, transparent 40%),
                  radial-gradient(circle at 50% 50%, #ffd700 0%, #eec900 20%, #daa520 40%, #cd9b1d 60%, #b8860b 80%, #8b6914 100%)
                `,
                boxShadow: `
                  inset 0 8px 25px rgba(255,255,255,0.5),
                  inset 0 -8px 25px rgba(0,0,0,0.4),
                  inset 3px 0 15px rgba(255,255,255,0.15),
                  inset -3px 0 15px rgba(0,0,0,0.25),
                  0 4px 20px rgba(0,0,0,0.3)
                `
              }}
            >
              {/* Inner rim detail */}
              <div 
                className="absolute inset-[4%] rounded-full"
                style={{ 
                  border: "3px solid rgba(139, 105, 20, 0.35)",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.2)"
                }}
              />

              {/* Dollar sign with 3D effect */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span 
                  className="text-7xl md:text-8xl lg:text-9xl font-black leading-none select-none"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    background: "linear-gradient(180deg, #a08020 0%, #6b5210 40%, #4a3810 70%, #3d2e08 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(2px 3px 0 rgba(255,250,205,0.4)) drop-shadow(-1px -1px 0 rgba(0,0,0,0.3))"
                  }}
                >
                  $
                </span>
                <span 
                  className="text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase select-none -mt-1"
                  style={{ 
                    color: "#6b5210",
                    textShadow: "1px 1px 0 rgba(255,250,205,0.3), -0.5px -0.5px 0 rgba(0,0,0,0.2)"
                  }}
                >
                  FLIP
                </span>
              </div>

              {/* Decorative studs around edge */}
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, #d4af37 0%, #8b6914 50%, #5a4510 100%)",
                    boxShadow: "inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)",
                    top: `${50 + 43 * Math.sin((i * Math.PI * 2) / 16)}%`,
                    left: `${50 + 43 * Math.cos((i * Math.PI * 2) / 16)}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                />
              ))}
            </div>

            {/* Top highlight arc */}
            <div 
              className="absolute top-[4%] left-[18%] right-[18%] h-[15%] rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.15) 50%, transparent 100%)"
              }}
            />

            {/* Side highlight */}
            <div 
              className="absolute top-[20%] left-[3%] w-[8%] h-[40%] rounded-full pointer-events-none"
              style={{
                background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)"
              }}
            />
          </div>
        </div>

        {/* Result glow */}
        {result && !isFlipping && (
          <div className={cn(
            "absolute -inset-10 rounded-full blur-3xl animate-pulse pointer-events-none",
            result === "burn" ? "bg-ember/50" : "bg-royal/50"
          )} />
        )}
      </div>

      {/* Ground shadow */}
      <div 
        className="w-36 h-6 md:w-44 md:h-7 rounded-[50%] bg-black/60 blur-xl mt-12 animate-shadow-pulse"
      />
      
      {/* Status badge */}
      <div className={cn(
        "mt-8 px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 border",
        isFlipping 
          ? "bg-primary/15 text-primary border-primary/30 shadow-[0_0_25px_hsl(160_84%_39%_/_0.25)]"
          : result === "burn"
            ? "bg-ember/15 text-ember border-ember/30 shadow-[0_0_25px_hsl(14_100%_57%_/_0.25)]"
            : result === "holder"
              ? "bg-royal/15 text-royal border-royal/30 shadow-[0_0_25px_hsl(265_70%_58%_/_0.25)]"
              : "bg-muted/30 text-muted-foreground border-border"
      )}>
        {isFlipping ? "Flipping..." : result === "burn" ? "Burned!" : result === "holder" ? "Winner!" : "Ready to Flip"}
      </div>
    </div>
  );
};

export default CasinoCoin;