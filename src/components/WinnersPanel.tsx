import { ExternalLink, Trophy, Flame, Clock, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WinnerRecord {
  id: number;
  type: "burn" | "holder";
  wallet?: string;
  amount: number;
  solAmount?: number;
  txHash: string;
  timestamp: Date;
}

interface WinnersPanelProps {
  winners: WinnerRecord[];
}

// Solana Logo
const SolanaLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 397.7 311.7" className={className} fill="currentColor">
    <linearGradient id="sol-grad-winners" x1="360.879" y1="351.455" x2="141.213" y2="-69.294" gradientTransform="matrix(1 0 0 -1 0 314)" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#00FFA3"/>
      <stop offset="1" stopColor="#DC1FFF"/>
    </linearGradient>
    <path fill="url(#sol-grad-winners)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z"/>
    <path fill="url(#sol-grad-winners)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z"/>
    <path fill="url(#sol-grad-winners)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z"/>
  </svg>
);

const WinnersPanel = ({ winners }: WinnersPanelProps) => {
  const formatWallet = (wallet: string) => {
    return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(2)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
    return amount.toLocaleString();
  };

  const recentWinners = winners.slice(-12).reverse();
  const burnCount = winners.filter(w => w.type === "burn").length;
  const holderCount = winners.filter(w => w.type === "holder").length;

  return (
    <div className="rounded-2xl overflow-hidden glass-premium">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center border border-accent/10">
            <Trophy className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Transaction History</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <SolanaLogo className="w-2.5 h-2.5" />
              Verified on Solscan
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-ember/10 border border-ember/20">
            <Flame className="w-3 h-3 text-ember" />
            <span className="text-[10px] font-bold text-ember">{burnCount}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-royal/10 border border-royal/20">
            <Trophy className="w-3 h-3 text-royal" />
            <span className="text-[10px] font-bold text-royal">{holderCount}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Amount
              </th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
              <th className="px-5 py-3 text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                TX
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {winners.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-muted/30 flex items-center justify-center border border-border/50 animate-float">
                      <Clock className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">No transactions yet</p>
                      <p className="text-[11px] text-muted-foreground/50 mt-1">Waiting for first flip...</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              recentWinners.map((winner, index) => (
                <tr 
                  key={winner.id}
                  className={cn(
                    "group hover:bg-muted/5 transition-all duration-300",
                    index === 0 && "animate-row-highlight"
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110",
                        winner.type === "burn" 
                          ? "bg-gradient-to-br from-ember/20 to-ember/5 border border-ember/20" 
                          : "bg-gradient-to-br from-royal/20 to-royal/5 border border-royal/20"
                      )}>
                        {winner.type === "burn" ? (
                          <Flame className="w-3.5 h-3.5 text-ember" />
                        ) : (
                          <Trophy className="w-3.5 h-3.5 text-royal" />
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-semibold",
                        winner.type === "burn" ? "text-ember" : "text-royal"
                      )}>
                        {winner.type === "burn" ? "Burn" : "Reward"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs text-foreground/80">
                      {winner.type === "burn" ? (
                        <span className="text-ember flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Burned
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-md bg-muted/30 border border-border/50">
                          {formatWallet(winner.wallet || "")}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "font-mono text-sm font-bold",
                        winner.type === "burn" ? "text-ember" : "text-royal"
                      )}>
                        {formatAmount(winner.amount)}
                      </span>
                      <span className="text-[9px] text-muted-foreground">tokens</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {winner.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <a
                      href={`https://solscan.io/tx/${winner.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300",
                        "bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 hover:border-primary/30",
                        "hover:scale-110 hover:shadow-[0_0_20px_hsl(160_84%_39%_/_0.2)]"
                      )}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {winners.length > 12 && (
        <div className="px-5 py-3 border-t border-border/30 bg-muted/5">
          <button className="w-full text-center text-xs text-primary hover:text-primary/80 font-semibold transition-colors flex items-center justify-center gap-1">
            View all {winners.length} transactions
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default WinnersPanel;