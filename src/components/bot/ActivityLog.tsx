interface LogEntry {
  t: number;
  msg: string;
}

export function ActivityLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold">Activity Log</h3>
        <span className="text-xs text-muted-foreground">{entries.length} events</span>
      </div>
      <div className="max-h-72 overflow-y-auto space-y-1.5 font-mono text-xs">
        {entries.length === 0 && (
          <div className="text-muted-foreground italic">Awaiting activity…</div>
        )}
        {entries.map((e, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-muted-foreground tabular shrink-0">
              {new Date(e.t).toLocaleTimeString()}
            </span>
            <span className="text-foreground/90">{e.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
