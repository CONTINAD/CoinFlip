import { Flame, Gift, Zap, Radio, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FlipRecord {
  id: number;
  result: "burn" | "holder";
  timestamp: Date;
}

interface LiveFeedProps {
  history: FlipRecord[];
}

const LiveFeed = ({ history }: LiveFeedProps) => {
  const recent = history.slice(-30).reverse();
  const burnCount = history.filter(h => h.result === "burn").length;
  const holderCount = history.filter(h => h.result === "holder").length;
  const burnPercent = history.length > 0 ? Math.round((burnCount / history.length) * 100) : 50;

  return (
    <div className="rounded-2xl overflow-hidden glass-premium">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-semibold">Live Feed</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live" />
          <span className="text-[8px] text-primary font-bold uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Stats bar */}
      {history.length > 0 && (
        <div className="px-4 py-3 border-b border-border/30 bg-muted/10">
          <div className="flex items-center justify-between text-[10px] mb-2">
            <span className="text-ember font-semibold">{burnPercent}% Burns</span>
            <span className="text-royal font-semibold">{100 - burnPercent}% Holders</span>
          </div>
          <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-ember to-flame transition-all duration-500 rounded-l-full"
              style={{ width: `${burnPercent}%` }}
            />
            <div 
              className="h-full bg-gradient-to-r from-[#9945FF] to-royal transition-all duration-500 rounded-r-full"
              style={{ width: `${100 - burnPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick results strip */}
      {history.length > 0 && (
        <div className="px-4 py-2.5 border-b border-border/30">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5">
            {history.slice(-20).reverse().map((record, i) => (
              <div
                key={record.id}
                className={cn(
                  "w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-300",
                  record.result === "burn" 
                    ? "bg-ember/15 border border-ember/20" 
                    : "bg-royal/15 border border-royal/20",
                  i === 0 && "ring-2 ring-primary/40 scale-110 mx-0.5"
                )}
              >
                {record.result === "burn" ? (
                  <Flame className="w-3 h-3 text-ember" />
                ) : (
                  <Gift className="w-3 h-3 text-royal" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="max-h-48 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 animate-float border border-border/50">
              <Zap className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">Waiting for flips...</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">Results appear here</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {recent.slice(0, 10).map((record, i) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center justify-between px-4 py-3 hover:bg-muted/5 transition-all duration-300",
                  i === 0 && "bg-muted/5"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center transition-transform hover:scale-110",
                    record.result === "burn" 
                      ? "bg-ember/10 border border-ember/20" 
                      : "bg-royal/10 border border-royal/20"
                  )}>
                    {record.result === "burn" ? (
                      <Flame className="w-3 h-3 text-ember" />
                    ) : (
                      <Gift className="w-3 h-3 text-royal" />
                    )}
                  </div>
                  <div>
                    <span className={cn(
                      "text-[11px] font-semibold block",
                      record.result === "burn" ? "text-ember" : "text-royal"
                    )}>
                      {record.result === "burn" ? "Buyback & Burn" : "Holder Reward"}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      #{history.length - i}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {record.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;