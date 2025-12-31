const BackgroundEffects = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Main gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(45_100%_55%_/_0.03)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(280_80%_55%_/_0.05)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(15_100%_55%_/_0.04)_0%,_transparent_50%)]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-3xl animate-orb" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-secondary/5 to-transparent blur-3xl animate-orb [animation-delay:7s]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-gold/3 to-transparent blur-3xl" />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(45 100% 55%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(45 100% 55%) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/40 animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
          }}
        />
      ))}

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/5 via-transparent to-transparent" />

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

export default BackgroundEffects;
