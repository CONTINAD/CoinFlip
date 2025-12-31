import { Flame, Gift, Coins, Users, TrendingUp, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardsPanelProps {
  totalBurned: number;
  totalToHolders: number;
  devRewards: number;
  totalFlips: number;
}

const RewardsPanel = ({ totalBurned, totalToHolders, devRewards, totalFlips }: RewardsPanelProps) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const stats = [
    {
      icon: Flame,
      label: "Total Burned",
      value: formatNumber(totalBurned),
      subValue: "tokens",
      color: "text-ember",
      bgColor: "bg-ember/10",
      borderColor: "border-ember/20",
      gradient: "from-ember/5 to-transparent",
    },
    {
      icon: Gift,
      label: "To Holders",
      value: formatNumber(totalToHolders),
      subValue: "tokens",
      color: "text-royal",
      bgColor: "bg-royal/10",
      borderColor: "border-royal/20",
      gradient: "from-royal/5 to-transparent",
    },
    {
      icon: Wallet,
      label: "Dev Rewards",
      value: formatNumber(devRewards),
      subValue: "tokens",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      gradient: "from-primary/5 to-transparent",
    },
    {
      icon: TrendingUp,
      label: "Total Flips",
      value: totalFlips.toString(),
      subValue: "rounds",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
      gradient: "from-accent/5 to-transparent",
    },
  ];

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "stake-card rounded-xl p-4 border transition-all duration-300 hover:border-opacity-50 group relative overflow-hidden",
              stat.borderColor
            )}
          >
            {/* Background gradient */}
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              stat.gradient
            )} />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                  stat.bgColor
                )}>
                  <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              
              <div className="flex items-baseline gap-1.5">
                <span className={cn("font-mono text-xl font-semibold", stat.color)}>
                  {stat.value}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {stat.subValue}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RewardsPanel;
