import { cn } from "@/lib/utils";
import { Flame, Gift, History } from "lucide-react";

export interface FlipRecord {
  id: number;
  result: "burn" | "holder";
  timestamp: Date;
}

interface PremiumHistoryProps {
  history: FlipRecord[];
}

const PremiumHistory = ({ history }: PremiumHistoryProps) => {
  const burnCount = history.filter((h) => h.result === "burn").length;
  const holderCount = history.filter((h) => h.result === "holder").length;
  const burnPercentage = history.length > 0 ? Math.round((burnCount / history.length) * 100) : 50;
  const holderPercentage = 100 - burnPercentage;

  return (
    <div className="w-full max-w-lg">
      <div className="glass-card-gold rounded-2xl p-6 border border-primary/10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-gold-dark/10 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Flip History
            </h2>
            <p className="text-xs text-muted-foreground">
              {history.length} total flips
            </p>
          </div>
        </div>

        {/* Stats bars */}
        <div className="mb-6 space-y-3">
          {/* Burn bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-ember" />
                <span className="text-sm font-medium">Burns</span>
              </div>
              <span className="text-sm font-display text-ember">{burnCount} ({burnPercentage}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-ember to-flame rounded-full transition-all duration-500"
                style={{ width: `${burnPercentage}%` }}
              />
            </div>
          </div>

          {/* Holder bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-royal" />
                <span className="text-sm font-medium">Holders</span>
              </div>
              <span className="text-sm font-display text-royal">{holderCount} ({holderPercentage}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-royal to-electric rounded-full transition-all duration-500"
                style={{ width: `${holderPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />

        {/* History list */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                No flips yet. Waiting for first flip...
              </p>
            </div>
          ) : (
            history.slice().reverse().map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-300",
                  "bg-muted/20 border border-border/30 hover:border-border/50",
                  index === 0 && "animate-in slide-in-from-top-2"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    record.result === "burn"
                      ? "bg-ember/20"
                      : "bg-royal/20"
                  )}>
                    {record.result === "burn" ? (
                      <Flame className="w-4 h-4 text-ember" />
                    ) : (
                      <Gift className="w-4 h-4 text-royal" />
                    )}
                  </div>
                  <div>
                    <span className={cn(
                      "font-medium text-sm",
                      record.result === "burn" ? "text-ember" : "text-royal"
                    )}>
                      {record.result === "burn" ? "Burn" : "Holder"}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      #{history.length - index}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {record.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumHistory;
