import { cn } from "@/lib/utils";

interface CasinoCoinProps {
  isFlipping: boolean;
  result: "burn" | "holder" | null;
}

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
      className="absolute inset-0 rounded-full overflow-hidden"
      style={{
        background: isHeads 
          ? `radial-gradient(ellipse 85% 55% at 28% 18%, rgba(255,250,205,0.95) 0%, transparent 32%),
             radial-gradient(ellipse 65% 45% at 72% 82%, rgba(120,90,15,0.6) 0%, transparent 38%),
             radial-gradient(circle at 50% 50%, #ffd700 0%, #f4c430 18%, #daa520 38%, #cd9b1d 55%, #b8860b 72%, #8b6914 88%, #6b5210 100%)`
          : `radial-gradient(ellipse 85% 55% at 28% 18%, rgba(200,150,220,0.7) 0%, transparent 32%),
             radial-gradient(ellipse 65% 45% at 72% 82%, rgba(60,0,100,0.6) 0%, transparent 38%),
             radial-gradient(circle at 50% 50%, #9932CC 0%, #8B2DB2 18%, #7B2795 38%, #6B0B6B 55%, #5B0A5B 72%, #4B0082 88%, #2E0854 100%)`,
        boxShadow: `
          inset 0 15px 50px rgba(255,255,255,0.55),
          inset 0 -15px 50px rgba(0,0,0,0.5),
          inset 10px 0 40px rgba(255,255,255,0.18),
          inset -10px 0 40px rgba(0,0,0,0.35),
          0 30px 60px -15px rgba(0,0,0,0.5)
        `,
        transform: isBack ? "rotateY(180deg)" : "rotateY(0deg)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden"
      }}
    >
      {/* Outer raised rim with 3D bevel */}
      <div 
        className="absolute inset-[2%] rounded-full"
        style={{
          background: `linear-gradient(145deg, 
            rgba(255,255,255,0.45) 0%, 
            rgba(255,255,255,0.15) 25%,
            transparent 50%, 
            rgba(0,0,0,0.15) 75%,
            rgba(0,0,0,0.4) 100%)`,
          boxShadow: `
            inset 0 4px 8px rgba(255,255,255,0.5), 
            inset 0 -4px 8px rgba(0,0,0,0.45)
          `
        }}
      />

      {/* Inner recessed area */}
      <div 
        className="absolute inset-[8%] rounded-full"
        style={{
          background: isHeads
            ? `radial-gradient(ellipse 75% 50% at 32% 22%, rgba(255,250,205,0.85) 0%, transparent 38%),
               radial-gradient(ellipse 55% 38% at 68% 78%, rgba(120,90,15,0.45) 0%, transparent 32%),
               radial-gradient(circle at 50% 50%, #ffd700 0%, #f4c430 22%, #daa520 42%, #cd9b1d 60%, #b8860b 78%, #8b6914 100%)`
            : `radial-gradient(ellipse 75% 50% at 32% 22%, rgba(180,130,200,0.65) 0%, transparent 38%),
               radial-gradient(ellipse 55% 38% at 68% 78%, rgba(60,0,100,0.45) 0%, transparent 32%),
               radial-gradient(circle at 50% 50%, #9932CC 0%, #8B2DB2 22%, #7B2795 42%, #6B0B6B 60%, #4B0082 78%, #2E0854 100%)`,
          boxShadow: `
            inset 0 8px 28px rgba(255,255,255,0.5),
            inset 0 -8px 28px rgba(0,0,0,0.45),
            inset 5px 0 18px rgba(255,255,255,0.12),
            inset -5px 0 18px rgba(0,0,0,0.28)
          `
        }}
      >
        {/* Inner rim detail */}
        <div 
          className="absolute inset-[4%] rounded-full"
          style={{ 
            border: `3px solid ${isHeads ? "rgba(160, 120, 30, 0.45)" : "rgba(140, 90, 170, 0.5)"}`,
            boxShadow: `
              inset 0 2px 4px rgba(255,255,255,0.25), 
              0 2px 4px rgba(0,0,0,0.25)
            `
          }}
        />

        {/* CENTER TEXT */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-2xl md:text-3xl lg:text-4xl font-black leading-none select-none tracking-tight"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: isHeads ? "#5a4510" : "#FFFFFF",
              textShadow: isHeads 
                ? "1px 1px 0 rgba(255,250,205,0.6), 2px 3px 4px rgba(0,0,0,0.35)"
                : "1px 1px 0 rgba(200,150,220,0.4), 2px 3px 6px rgba(0,0,0,0.6), 0 0 20px rgba(153,50,204,0.3)"
            }}
          >
            {isHeads ? "HEADS" : "HOLDER"}
          </span>
        </div>

        {/* Decorative studs */}
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 md:w-2.5 md:h-2.5 rounded-full"
            style={{
              background: isHeads 
                ? "radial-gradient(circle at 28% 28%, #f4c430 0%, #daa520 35%, #8b6914 70%, #5a4510 100%)"
                : "radial-gradient(circle at 28% 28%, #B266B2 0%, #9932CC 35%, #6B0B6B 70%, #2E0854 100%)",
              boxShadow: `
                inset 0 1px 3px rgba(255,255,255,0.5), 
                inset 0 -1px 2px rgba(0,0,0,0.5), 
                0 2px 4px rgba(0,0,0,0.35)
              `,
              top: `${50 + 43 * Math.sin((i * Math.PI * 2) / 16)}%`,
              left: `${50 + 43 * Math.cos((i * Math.PI * 2) / 16)}%`,
              transform: "translate(-50%, -50%)"
            }}
          />
        ))}
      </div>

      {/* Top highlight arc */}
      <div 
        className="absolute top-[3%] left-[16%] right-[16%] h-[16%] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, transparent 100%)"
        }}
      />

      {/* Side highlight */}
      <div 
        className="absolute top-[18%] left-[2%] w-[9%] h-[42%] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)"
        }}
      />

      {/* Bottom shadow */}
      <div 
        className="absolute bottom-[4%] left-[22%] right-[22%] h-[10%] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(0deg, rgba(0,0,0,0.18) 0%, transparent 100%)"
        }}
      />
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
        style={{ perspective: "1000px" }}
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

        {/* Result glow */}
        {result && !isFlipping && (
          <div className={cn(
            "absolute -inset-8 rounded-full blur-2xl animate-pulse pointer-events-none",
            result === "burn" ? "bg-ember/40" : "bg-purple-600/40"
          )} />
        )}
      </div>

      {/* Ground shadow */}
      <div 
        className="w-40 h-6 md:w-48 md:h-7 rounded-[50%] bg-black/50 blur-xl mt-10 animate-shadow-pulse"
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