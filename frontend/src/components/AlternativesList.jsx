export default function AlternativesList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="animate-rise mt-6 max-w-md mx-auto">
      <p className="font-mono text-[11px] tracking-[0.2em] text-paper/40 uppercase mb-2 px-1">
        Also on the counter
      </p>
      <div className="flex flex-col gap-1.5">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between rounded-sm border border-ink-600/50 bg-ink-800/40 px-4 py-2.5 text-sm"
          >
            <span className="text-paper/80">{it.name}</span>
            <span className="font-mono text-paper/50 tabular text-xs">
              ₹{it.effective_price.toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
