import { Flame, Gift, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardsPanelProps {
  totalBurnedSol: number;
  totalToHoldersSol: number;
  devRewardsSol: number;
  totalFlips: number;
}

// Solana Logo Component
const SolanaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 397.7 311.7" className={className} fill="currentColor">
    <linearGradient id="solana-gradient-rewards" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientTransform="matrix(1 0 0 -1 0 314)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path fill="url(#solana-gradient-rewards)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
    <path fill="url(#solana-gradient-rewards)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
    <path fill="url(#solana-gradient-rewards)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
  </svg>
);

const RewardsPanel = ({ totalBurnedSol, totalToHoldersSol, devRewardsSol, totalFlips }: RewardsPanelProps) => {
  const stats = [
    {
      icon: Flame,
      label: "Total Burned",
      value: totalBurnedSol.toFixed(4),
      subValue: "SOL",
      color: "text-ember",
      bgColor: "bg-ember/10",
      borderColor: "border-ember/20",
      hoverBorder: "hover:border-ember/40",
      glowColor: "group-hover:shadow-[0_0_30px_hsl(14_100%_57%_/_0.15)]",
    },
    {
      icon: Gift,
      label: "To Holders",
      value: totalToHoldersSol.toFixed(4),
      subValue: "SOL",
      color: "text-royal",
      bgColor: "bg-royal/10",
      borderColor: "border-royal/20",
      hoverBorder: "hover:border-royal/40",
      glowColor: "group-hover:shadow-[0_0_30px_hsl(265_70%_58%_/_0.15)]",
    },
    {
      icon: null,
      label: "Dev Rewards",
      value: devRewardsSol.toFixed(3),
      subValue: "SOL",
      color: "text-[#14F195]",
      bgColor: "bg-[#14F195]/10",
      borderColor: "border-[#14F195]/20",
      hoverBorder: "hover:border-[#14F195]/40",
      glowColor: "group-hover:shadow-[0_0_30px_hsl(160_90%_51%_/_0.15)]",
      isSolana: true,
    },
    {
      icon: TrendingUp,
      label: "Total Flips",
      value: totalFlips.toString(),
      subValue: "rounds",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
      hoverBorder: "hover:border-accent/40",
      glowColor: "group-hover:shadow-[0_0_30px_hsl(45_100%_50%_/_0.15)]",
    },
  ];

  return (
    <div className="w-full">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em]">Statistics</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "group relative rounded-xl overflow-hidden transition-all duration-500 cursor-default",
              "glass-premium",
              stat.borderColor,
              stat.hoverBorder,
              stat.glowColor
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Shimmer effect */}
            <div className="shimmer absolute inset-0" />
            
            {/* Hover gradient */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              stat.bgColor
            )} style={{ filter: "blur(40px)" }} />
            
            <div className="relative z-10 p-4 md:p-5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                  stat.bgColor,
                  "border border-transparent group-hover:border-current/10"
                )}>
                  {stat.isSolana ? (
                    <SolanaLogo className="w-5 h-5" />
                  ) : (
                    stat.icon && <stat.icon className={cn("w-4 h-4", stat.color)} />
                  )}
                </div>
              </div>
              
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] mb-1.5">
                {stat.label}
              </p>
              
              <div className="flex items-baseline gap-1.5">
                <span className={cn(
                  "font-mono text-2xl md:text-3xl font-bold tracking-tight transition-all duration-300",
                  stat.color
                )}>
                  {stat.value}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {stat.subValue}
                </span>
              </div>
            </div>

            {/* Bottom accent line */}
            <div className={cn(
              "absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-500",
              "bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-30",
              stat.color
            )} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsPanel;