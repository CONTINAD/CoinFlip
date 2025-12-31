import { ExternalLink, Trophy, Flame, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WinnerRecord {
  id: number;
  type: "burn" | "holder";
  wallet?: string;
  amount: number;
  txHash: string;
  timestamp: Date;
}

interface WinnersPanelProps {
  winners: WinnerRecord[];
}

const WinnersPanel = ({ winners }: WinnersPanelProps) => {
  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  const recentWinners = winners.slice(-10).reverse();

  return (
    <div className="stake-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Trophy className="w-4 h-4 text-accent" />
          <span className="font-semibold text-sm">Recent Winners</span>
        </div>
        <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-muted">
          Last {Math.min(winners.length, 10)}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-5 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-5 py-2.5 text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Winner
              </th>
              <th className="px-5 py-2.5 text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-2.5 text-right text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-5 py-2.5 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                TX
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {winners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No winners yet</p>
                    <p className="text-xs text-muted-foreground/60">Waiting for first flip...</p>
                  </div>
                </td>
              </tr>
            ) : (
              recentWinners.map((winner, index) => (
                <tr 
                  key={winner.id}
                  className={cn(
                    "hover:bg-muted/20 transition-colors",
                    index === 0 && "animate-row-highlight"
                  )}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center",
                        winner.type === "burn" ? "bg-ember/15" : "bg-royal/15"
                      )}>
                        {winner.type === "burn" ? (
                          <Flame className="w-3.5 h-3.5 text-ember" />
                        ) : (
                          <Trophy className="w-3.5 h-3.5 text-royal" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-medium",
                        winner.type === "burn" ? "text-ember" : "text-royal"
                      )}>
                        {winner.type === "burn" ? "Burn" : "Holder"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs text-foreground">
                      {winner.type === "burn" ? "Burned 🔥" : formatWallet(winner.wallet || "")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn(
                      "font-mono text-xs font-medium",
                      winner.type === "burn" ? "text-ember" : "text-royal"
                    )}>
                      {formatAmount(winner.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-[11px] text-muted-foreground">
                      {winner.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <a
                      href={`https://solscan.io/tx/${winner.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View all link */}
      {winners.length > 10 && (
        <div className="px-5 py-3 border-t border-border text-center">
          <button className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
            View all {winners.length} transactions →
          </button>
        </div>
      )}
    </div>
  );
};

export default WinnersPanel;
