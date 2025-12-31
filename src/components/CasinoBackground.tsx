const CasinoBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 0%, hsl(228 30% 6%) 0%, hsl(228 30% 3%) 100%)
          `
        }}
      />

      {/* Top ambient glow */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 100% 50% at 50% -10%, hsl(160 84% 39% / 0.06) 0%, transparent 60%)`
        }}
      />

      {/* Corner accent glows */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 0% 0%, hsl(160 84% 39% / 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 100% 0%, hsl(265 70% 58% / 0.03) 0%, transparent 50%),
            radial-gradient(ellipse 70% 40% at 100% 100%, hsl(265 70% 58% / 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 70% 40% at 0% 100%, hsl(14 100% 57% / 0.03) 0%, transparent 50%)
          `
        }}
      />

      {/* Center focal point */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, hsl(45 100% 50% / 0.015) 0%, transparent 60%)`
        }}
      />

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(160 84% 39%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(160 84% 39%) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating particles */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-0.5 h-0.5 rounded-full bg-primary/30 animate-float"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 70% at center, transparent 0%, hsl(228 30% 3%) 100%)`
        }}
      />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      {/* Noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
};

export default CasinoBackground;