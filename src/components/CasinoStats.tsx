import { Flame, Gift, Zap, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CasinoStatsProps {
  totalFlips: number;
  burnCount: number;
  holderCount: number;
}

const CasinoStats = ({ totalFlips, burnCount, holderCount }: CasinoStatsProps) => {
  const burnRate = totalFlips > 0 ? Math.round((burnCount / totalFlips) * 100) : 50;

  const stats = [
    {
      icon: Zap,
      label: "Total Flips",
      value: totalFlips,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      icon: Flame,
      label: "Burns",
      value: burnCount,
      color: "text-ember",
      bgColor: "bg-ember/10",
      borderColor: "border-ember/20",
    },
    {
      icon: Gift,
      label: "Rewards",
      value: holderCount,
      color: "text-royal",
      bgColor: "bg-royal/10",
      borderColor: "border-royal/20",
    },
    {
      icon: TrendingUp,
      label: "Burn Rate",
      value: `${burnRate}%`,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "casino-card rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02]",
            stat.borderColor
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              stat.bgColor
            )}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {stat.label}
          </p>
          <p className={cn("font-display text-2xl font-bold", stat.color)}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CasinoStats;
