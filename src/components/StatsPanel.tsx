import { TrendingUp, Users, Coins, Zap } from "lucide-react";

interface StatsPanelProps {
  totalFlips: number;
  totalBurned: string;
  holdersRewarded: number;
}

const StatsPanel = ({ totalFlips, totalBurned, holdersRewarded }: StatsPanelProps) => {
  const stats = [
    {
      icon: Zap,
      label: "Total Flips",
      value: totalFlips.toString(),
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      icon: TrendingUp,
      label: "Total Burned",
      value: totalBurned,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
    },
    {
      icon: Users,
      label: "Holders Rewarded",
      value: holdersRewarded.toString(),
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/20",
    },
    {
      icon: Coins,
      label: "Pool Size",
      value: "1,000",
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/20",
    },
  ];

  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`gradient-border rounded-xl p-4 bg-card/50 backdrop-blur-sm border ${stat.borderColor}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className={`font-display text-xl font-bold ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPanel;
