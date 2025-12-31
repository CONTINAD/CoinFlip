import { TrendingUp, Users, Flame, Gift, Zap, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumStatsProps {
  totalFlips: number;
  burnCount: number;
  holderCount: number;
}

const PremiumStats = ({ totalFlips, burnCount, holderCount }: PremiumStatsProps) => {
  const stats = [
    {
      icon: Zap,
      label: "Total Flips",
      value: totalFlips,
      gradient: "from-primary/20 to-gold-dark/10",
      iconColor: "text-primary",
      borderColor: "border-primary/20",
      glowColor: "shadow-[0_0_30px_hsl(45_100%_55%_/_0.1)]",
    },
    {
      icon: Flame,
      label: "Burns",
      value: burnCount,
      gradient: "from-ember/20 to-flame/10",
      iconColor: "text-ember",
      borderColor: "border-ember/20",
      glowColor: "shadow-[0_0_30px_hsl(15_100%_55%_/_0.1)]",
    },
    {
      icon: Gift,
      label: "Rewards",
      value: holderCount,
      gradient: "from-royal/20 to-electric/10",
      iconColor: "text-royal",
      borderColor: "border-royal/20",
      glowColor: "shadow-[0_0_30px_hsl(280_80%_55%_/_0.1)]",
    },
    {
      icon: Coins,
      label: "Pool",
      value: "1,000",
      suffix: "K",
      gradient: "from-accent/20 to-neon/10",
      iconColor: "text-accent",
      borderColor: "border-accent/20",
      glowColor: "shadow-[0_0_30px_hsl(160_100%_45%_/_0.1)]",
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "relative group glass-card rounded-2xl p-5 border transition-all duration-300",
              stat.borderColor,
              stat.glowColor,
              "hover:scale-[1.02] hover:border-opacity-40"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Background gradient */}
            <div className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-50",
              stat.gradient
            )} />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  `bg-gradient-to-br ${stat.gradient}`
                )}>
                  <stat.icon className={cn("w-5 h-5", stat.iconColor)} />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              
              <p className={cn("font-display text-2xl font-bold", stat.iconColor)}>
                {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                {stat.suffix && <span className="text-lg opacity-70">{stat.suffix}</span>}
              </p>
            </div>

            {/* Hover shine effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PremiumStats;
