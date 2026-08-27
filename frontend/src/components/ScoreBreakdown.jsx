const LABELS = {
  price: "Effective price",
  rating: "Rating",
  priority: "Your priority",
  cashback: "Cashback benefit",
};

const COLORS = {
  price: "bg-signal-amber",
  rating: "bg-signal-cyan",
  priority: "bg-emerald-400",
  cashback: "bg-fuchsia-400",
};

export default function ScoreBreakdown({ breakdown, weights }) {
  if (!breakdown) return null;
  const entries = Object.entries(breakdown);

  return (
    <div className="mt-5 pt-5 border-t border-navy-700">
      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-mono mb-3">
        Why this won — score breakdown
      </p>
      <div className="flex flex-col gap-2.5">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0">{LABELS[key] || key}</span>
            <div className="flex-1 h-2 rounded-full bg-navy-900 overflow-hidden">
              <div
                className={`h-full rounded-full ${COLORS[key] || "bg-slate-500"} transition-all duration-700`}
                style={{ width: `${Math.max(value, 3)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-slate-400 w-10 text-right">{value}</span>
            {weights?.[key] && (
              <span className="font-mono text-[10px] text-slate-600 w-14 text-right">
                ×{weights[key].toFixed(2)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
