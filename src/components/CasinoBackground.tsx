const CasinoBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, hsl(142 72% 50% / 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 90% 80%, hsl(270 70% 55% / 0.05) 0%, transparent 40%),
            radial-gradient(ellipse 60% 40% at 10% 80%, hsl(16 100% 55% / 0.05) 0%, transparent 40%)
          `
        }}
      />

      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(0 0% 100%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Ambient light spots */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/3 blur-[120px]" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[200px] rounded-full bg-ember/3 blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] rounded-full bg-royal/3 blur-[100px]" />

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, hsl(220 20% 4%) 100%)`
        }}
      />

      {/* Top bar glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </div>
  );
};

export default CasinoBackground;
