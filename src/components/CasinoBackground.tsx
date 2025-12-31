const CasinoBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 50% -10%, hsl(145 80% 42% / 0.06) 0%, transparent 50%),
            radial-gradient(ellipse 80% 50% at 100% 100%, hsl(265 70% 58% / 0.04) 0%, transparent 40%),
            radial-gradient(ellipse 80% 50% at 0% 100%, hsl(14 100% 57% / 0.04) 0%, transparent 40%)
          `
        }}
      />

      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(0 0% 100%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Top glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 60% at center, transparent 0%, hsl(225 25% 3%) 100%)`
        }}
      />

      {/* Top bar glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
};

export default CasinoBackground;
