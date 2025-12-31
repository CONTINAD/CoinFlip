import { Trophy, Flame, Medal, Crown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  id: number;
  wallet: string;
  totalWins: number;
  totalAmount: number;
  lastWin: Date;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  totalBurnedSol: number;
}

const Leaderboard = ({ entries, totalBurnedSol }: LeaderboardProps) => {
  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(251, 191, 36, 0.6))" }} />;
      case 2:
        return <Medal className="w-4 h-4 text-slate-300" style={{ filter: "drop-shadow(0 0 4px rgba(203, 213, 225, 0.5))" }} />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600" style={{ filter: "drop-shadow(0 0 4px rgba(217, 119, 6, 0.5))" }} />;
      default:
        return <span className="text-[10px] font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border-amber-500/20";
      case 2:
        return "bg-gradient-to-r from-slate-400/10 via-slate-300/5 to-transparent border-slate-400/20";
      case 3:
        return "bg-gradient-to-r from-amber-700/10 via-amber-600/5 to-transparent border-amber-700/20";
      default:
        return "border-border/30 hover:border-border/50";
    }
  };

  const topHolders = entries.slice(0, 10);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {/* Top Winners */}
      <div className="rounded-2xl overflow-hidden glass-premium">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center border border-amber-500/20">
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Top Winners</h3>
              <p className="text-[10px] text-muted-foreground">All-time leaderboard</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-royal/10 border border-royal/20">
            <TrendingUp className="w-3 h-3 text-royal" />
            <span className="text-[10px] font-bold text-royal">{entries.length}</span>
          </div>
        </div>

        <div className="divide-y divide-border/20">
          {topHolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 animate-float border border-border/50">
                <Trophy className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-xs text-muted-foreground font-medium">No winners yet</p>
              <p className="text-[10px] text-muted-foreground/50 mt-1">Be the first!</p>
            </div>
          ) : (
            topHolders.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center justify-between px-5 py-3.5 transition-all duration-300",
                  getRankStyle(index + 1),
                  index < 3 && "border-l-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-muted/30 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div>
                    <span className="font-mono text-xs text-foreground block">
                      {formatWallet(entry.wallet)}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {entry.totalWins} win{entry.totalWins > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-royal block">
                    {entry.totalAmount.toFixed(4)}
                  </span>
                  <span className="text-[9px] text-muted-foreground">SOL won</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Burn Stats */}
      <div className="rounded-2xl overflow-hidden glass-premium">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ember/20 to-flame/10 flex items-center justify-center border border-ember/20">
              <Flame className="w-4 h-4 text-ember" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Burn Statistics</h3>
              <p className="text-[10px] text-muted-foreground">Deflationary metrics</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          {/* Big burn counter */}
          <div className="text-center mb-6 py-6 rounded-xl bg-gradient-to-br from-ember/10 via-ember/5 to-transparent border border-ember/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-ember animate-pulse" />
              <span className="text-[10px] font-semibold text-ember uppercase tracking-wider">Total Burned</span>
            </div>
            <span className="font-mono text-4xl md:text-5xl font-black text-gradient-ember">
              {totalBurnedSol.toFixed(4)}
            </span>
            <p className="text-[10px] text-muted-foreground mt-2">SOL burned forever</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center">
              <span className="text-2xl font-bold text-foreground block">{entries.length > 0 ? Math.round(entries.reduce((acc, e) => acc + e.totalWins, 0) / 2) : 0}</span>
              <span className="text-[10px] text-muted-foreground">Burn Events</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center">
              <span className="text-2xl font-bold text-foreground block">
                {entries.length > 0 ? (totalBurnedSol / Math.max(1, Math.round(entries.reduce((acc, e) => acc + e.totalWins, 0) / 2))).toFixed(4) : '0'}
              </span>
              <span className="text-[10px] text-muted-foreground">Avg SOL/Burn</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center">
              <span className="text-2xl font-bold text-primary block">50%</span>
              <span className="text-[10px] text-muted-foreground">Burn Rate</span>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border/50 text-center">
              <span className="text-2xl font-bold text-foreground block">∞</span>
              <span className="text-[10px] text-muted-foreground">Deflation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;