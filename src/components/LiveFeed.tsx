import { Flame, Gift, Zap } from "lucide-react";
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
  const recent = history.slice(-20).reverse();

  return (
    <div className="stake-card rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Live Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-live" />
          <span className="text-[10px] text-muted-foreground uppercase">Live</span>
        </div>
      </div>

      {/* Quick icons row */}
      {history.length > 0 && (
        <div className="px-5 py-2.5 border-b border-border bg-muted/20">
          <div className="flex items-center gap-1 overflow-x-auto">
            {history.slice(-20).reverse().map((record, i) => (
              <div
                key={record.id}
                className={cn(
                  "w-6 h-6 rounded flex items-center justify-center shrink-0 transition-all",
                  record.result === "burn"
                    ? "bg-ember/15"
                    : "bg-royal/15",
                  i === 0 && "ring-1 ring-primary/40 scale-110"
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
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">Waiting for flips...</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((record, i) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center justify-between px-5 py-2.5 hover:bg-muted/10 transition-colors",
                  i === 0 && "bg-muted/10"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center",
                    record.result === "burn" ? "bg-ember/10" : "bg-royal/10"
                  )}>
                    {record.result === "burn" ? (
                      <Flame className="w-3.5 h-3.5 text-ember" />
                    ) : (
                      <Gift className="w-3.5 h-3.5 text-royal" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    record.result === "burn" ? "text-ember" : "text-royal"
                  )}>
                    {record.result === "burn" ? "Burn" : "Holder"}
                  </span>
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
