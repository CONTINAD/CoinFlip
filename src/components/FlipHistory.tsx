import { cn } from "@/lib/utils";
import { Flame, Gift } from "lucide-react";

export interface FlipRecord {
  id: number;
  result: "burn" | "holder";
  timestamp: Date;
}

interface FlipHistoryProps {
  history: FlipRecord[];
}

const FlipHistory = ({ history }: FlipHistoryProps) => {
  const burnCount = history.filter((h) => h.result === "burn").length;
  const holderCount = history.filter((h) => h.result === "holder").length;

  return (
    <div className="w-full max-w-md">
      <div className="gradient-border rounded-xl p-6 bg-card/50 backdrop-blur-sm">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Flip History
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4 text-destructive" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Burns</span>
            </div>
            <p className="font-display text-2xl font-bold text-destructive">{burnCount}</p>
          </div>
          
          <div className="bg-secondary/10 rounded-lg p-3 border border-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-secondary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Holders</span>
            </div>
            <p className="font-display text-2xl font-bold text-secondary">{holderCount}</p>
          </div>
        </div>

        {/* History list */}
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">
              No flips yet. Waiting for first flip...
            </p>
          ) : (
            history.slice().reverse().map((record) => (
              <div
                key={record.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  "bg-muted/30 border border-border/50",
                  "animate-in slide-in-from-top-2 duration-300"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      record.result === "burn"
                        ? "bg-destructive/20"
                        : "bg-secondary/20"
                    )}
                  >
                    {record.result === "burn" ? (
                      <Flame className="w-4 h-4 text-destructive" />
                    ) : (
                      <Gift className="w-4 h-4 text-secondary" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "font-medium text-sm",
                      record.result === "burn"
                        ? "text-destructive"
                        : "text-secondary"
                    )}
                  >
                    {record.result === "burn" ? "Burn" : "Holder"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
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

export default FlipHistory;
