import { cn } from "@/lib/utils";

interface CasinoCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

const CoinEdge = ({ isHeads }: { isHeads: boolean }) => {
  // Create multiple edge segments for 3D depth effect
  const edgeLayers = [];
  for (let i = 0; i < 12; i++) {
    const zOffset = -1 - i * 1.2;
    edgeLayers.push(
      <div
        key={i}
        className="absolute inset-[1%] rounded-full"
        style={{
          background: isHeads
            ? `linear-gradient(${160 + i * 3}deg, 
                ${i % 2 === 0 ? '#c9a227' : '#8b6914'} 0%, 
                ${i % 2 === 0 ? '#8b6914' : '#5a4510'} 50%, 
                ${i % 2 === 0 ? '#6b5210' : '#3d2e08'} 100%)`
            : `linear-gradient(${160 + i * 3}deg, 
                ${i % 2 === 0 ? '#7B2D8E' : '#5B1A6B'} 0%, 
                ${i % 2 === 0 ? '#5B1A6B' : '#3D0F4A'} 50%, 
                ${i % 2 === 0 ? '#4B0082' : '#2E0854'} 100%)`,
          transform: `translateZ(${zOffset}px)`,
          boxShadow: i === 0 
            ? "inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.4)"
            : undefined
        }}
      />
    );
  }
  return <>{edgeLayers}</>;
};

const CoinFace = ({ 
  type, 
  isBack = false 
}: { 
  type: "heads" | "holder"; 
  isBack?: boolean;
}) => {
  const isHeads = type === "heads";
  
  return (
    <div 
      className="absolute inset-0 rounded-full"
      style={{
        transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        transformStyle: "preserve-3d"
      }}
    >
      {/* 3D Edge layers */}
      <CoinEdge isHeads={isHeads} />
      
      {/* Main coin face */}
      <div 
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: isHeads 
            ? `radial-gradient(ellipse 90% 60% at 25% 15%, rgba(255,250,205,0.95) 0%, transparent 30%),
               radial-gradient(ellipse 70% 50% at 75% 85%, rgba(139,105,20,0.7) 0%, transparent 35%),
               radial-gradient(ellipse 50% 30% at 50% 50%, rgba(255,223,0,0.3) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, #ffd700 0%, #f4c430 15%, #daa520 35%, #cd9b1d 50%, #b8860b 70%, #8b6914 90%, #6b5210 100%)`
            : `radial-gradient(ellipse 90% 60% at 25% 15%, rgba(200,150,220,0.7) 0%, transparent 30%),
               radial-gradient(ellipse 70% 50% at 75% 85%, rgba(75,0,130,0.7) 0%, transparent 35%),
               radial-gradient(ellipse 50% 30% at 50% 50%, rgba(153,50,204,0.3) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, #9932CC 0%, #8B2DB2 15%, #7B2795 35%, #6B0B6B 50%, #5B0A5B 70%, #4B0082 90%, #2E0854 100%)`,
          boxShadow: `
            inset 0 12px 50px rgba(255,255,255,0.6),
            inset 0 -12px 50px rgba(0,0,0,0.5),
            inset 8px 0 35px rgba(255,255,255,0.2),
            inset -8px 0 35px rgba(0,0,0,0.35),
            0 25px 60px -15px rgba(0,0,0,0.5)
          `,
          transform: "translateZ(1px)"
        }}
      >
        {/* Outer raised rim */}
        <div 
          className="absolute inset-[2%] rounded-full"
          style={{
            background: `linear-gradient(135deg, 
              rgba(255,255,255,0.4) 0%, 
              rgba(255,255,255,0.1) 30%,
              transparent 50%, 
              rgba(0,0,0,0.1) 70%,
              rgba(0,0,0,0.35) 100%)`,
            boxShadow: `
              inset 0 3px 6px rgba(255,255,255,0.5), 
              inset 0 -3px 6px rgba(0,0,0,0.4),
              0 2px 4px rgba(0,0,0,0.2)
            `
          }}
        />

        {/* Inner recessed area with depth */}
        <div 
          className="absolute inset-[7%] rounded-full"
          style={{
            background: isHeads
              ? `radial-gradient(ellipse 80% 55% at 30% 20%, rgba(255,250,205,0.9) 0%, transparent 35%),
                 radial-gradient(ellipse 60% 40% at 70% 80%, rgba(139,105,20,0.5) 0%, transparent 35%),
                 radial-gradient(circle at 50% 50%, #ffd700 0%, #f4c430 20%, #daa520 40%, #cd9b1d 60%, #b8860b 80%, #8b6914 100%)`
              : `radial-gradient(ellipse 80% 55% at 30% 20%, rgba(180,130,200,0.7) 0%, transparent 35%),
                 radial-gradient(ellipse 60% 40% at 70% 80%, rgba(75,0,130,0.5) 0%, transparent 35%),
                 radial-gradient(circle at 50% 50%, #9932CC 0%, #8B2DB2 20%, #7B2795 40%, #6B0B6B 60%, #4B0082 80%, #2E0854 100%)`,
            boxShadow: `
              inset 0 6px 20px rgba(255,255,255,0.45),
              inset 0 -6px 20px rgba(0,0,0,0.4),
              inset 4px 0 12px rgba(255,255,255,0.15),
              inset -4px 0 12px rgba(0,0,0,0.25),
              0 3px 15px rgba(0,0,0,0.25)
            `
          }}
        >
          {/* Inner decorative rim */}
          <div 
            className="absolute inset-[3%] rounded-full"
            style={{ 
              border: `2px solid ${isHeads ? "rgba(180, 140, 40, 0.5)" : "rgba(150, 100, 180, 0.5)"}`,
              boxShadow: `
                inset 0 1px 3px rgba(255,255,255,0.25), 
                0 1px 3px rgba(0,0,0,0.25)
              `
            }}
          />

          {/* Text with enhanced 3D effect */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span 
              className={cn(
                "text-2xl md:text-3xl lg:text-4xl font-black leading-none select-none tracking-tight",
                !isHeads && "text-white"
              )}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                ...(isHeads 
                  ? {
                      background: "linear-gradient(180deg, #c9a227 0%, #8b6914 35%, #5a4510 65%, #3d2e08 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      filter: "drop-shadow(1px 2px 0 rgba(255,250,205,0.5)) drop-shadow(2px 4px 2px rgba(0,0,0,0.4))"
                    }
                  : {
                      textShadow: "1px 2px 0 rgba(255,200,255,0.3), 2px 4px 6px rgba(0,0,0,0.6), 0 0 25px rgba(153,50,204,0.4)"
                    }
                )
              }}
            >
              {isHeads ? "HEADS" : "HOLDER"}
            </span>
          </div>

          {/* Decorative studs with 3D effect */}
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
              style={{
                background: isHeads 
                  ? "radial-gradient(circle at 25% 25%, #f4c430 0%, #daa520 30%, #8b6914 70%, #5a4510 100%)"
                  : "radial-gradient(circle at 25% 25%, #B266B2 0%, #9932CC 30%, #6B0B6B 70%, #2E0854 100%)",
                boxShadow: `
                  inset 0 1px 3px rgba(255,255,255,0.5), 
                  inset 0 -1px 2px rgba(0,0,0,0.5), 
                  0 2px 4px rgba(0,0,0,0.4),
                  0 0 1px rgba(0,0,0,0.3)
                `,
                top: `${50 + 43 * Math.sin((i * Math.PI * 2) / 16)}%`,
                left: `${50 + 43 * Math.cos((i * Math.PI * 2) / 16)}%`,
                transform: "translate(-50%, -50%)"
              }}
            />
          ))}
        </div>

        {/* Primary highlight arc (top) */}
        <div 
          className="absolute top-[3%] left-[15%] right-[15%] h-[18%] rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 40%, transparent 100%)"
          }}
        />

        {/* Secondary highlight (side) */}
        <div 
          className="absolute top-[15%] left-[2%] w-[10%] h-[45%] rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)"
          }}
        />

        {/* Bottom shadow curve */}
        <div 
          className="absolute bottom-[3%] left-[20%] right-[20%] h-[12%] rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)"
          }}
        />
      </div>
    </div>
  );
};

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
            ? "bg-gradient-radial from-purple-600/50 to-transparent"
            : "bg-gradient-radial from-amber-500/30 to-transparent"
      )} />

      {/* Coin container */}
      <div 
        className="relative w-52 h-52 md:w-64 md:h-64 lg:w-72 lg:h-72"
        style={{ perspective: "1200px" }}
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
            isFlipping && "animate-coin-flip"
          )}
          style={{ 
            transformStyle: "preserve-3d",
            transform: !isFlipping && result === "holder" ? "rotateY(180deg)" : !isFlipping ? "rotateY(0deg)" : undefined,
            transition: !isFlipping ? "transform 0.3s ease-out" : undefined
          }}
        >
          {/* HEADS side (front - gold) */}
          <CoinFace type="heads" isBack={false} />
          
          {/* HOLDER side (back - purple) */}
          <CoinFace type="holder" isBack={true} />
        </div>

        {/* Result glow ring */}
        {result && !isFlipping && (
          <div className={cn(
            "absolute -inset-8 rounded-full blur-2xl animate-pulse pointer-events-none",
            result === "burn" ? "bg-ember/40" : "bg-purple-600/40"
          )} />
        )}
      </div>

      {/* Ground shadow */}
      <div 
        className="w-40 h-7 md:w-48 md:h-8 rounded-[50%] bg-black/50 blur-xl mt-10 animate-shadow-pulse"
      />
      
      {/* Status badge */}
      <div className={cn(
        "mt-8 px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-500 border",
        isFlipping 
          ? "bg-primary/15 text-primary border-primary/30 shadow-[0_0_25px_hsl(160_84%_39%_/_0.25)]"
          : result === "burn"
            ? "bg-ember/15 text-ember border-ember/30 shadow-[0_0_25px_hsl(14_100%_57%_/_0.25)]"
            : result === "holder"
              ? "bg-purple-600/15 text-purple-400 border-purple-600/30 shadow-[0_0_25px_rgba(147,51,234,0.25)]"
              : "bg-muted/30 text-muted-foreground border-border"
      )}>
        {isFlipping ? "Flipping..." : result === "burn" ? "HEADS - Burn!" : result === "holder" ? "HOLDER - Winner!" : "Ready to Flip"}
      </div>
    </div>
  );
};

export default CasinoCoin;