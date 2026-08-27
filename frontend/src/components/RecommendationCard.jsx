import CountUp from "./CountUp";
import ScoreBreakdown from "./ScoreBreakdown";

export default function RecommendationCard({ item }) {
  if (!item) return null;
  const savingsPct = item.price ? Math.round((item.benefit / item.price) * 100) : 0;

  return (
    <div className="animate-rise rounded-2xl border border-navy-600 bg-navy-800/80 p-6 md:p-8 shadow-[0_0_40px_-15px_rgba(56,189,248,0.25)]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs uppercase tracking-widest text-signal-cyan font-mono">Recommended</span>
        <span className="font-mono text-xs text-slate-400">Match score {item.score}/100</span>
      </div>
      <h2 className="font-display text-2xl md:text-3xl text-white font-semibold mb-1">{item.name}</h2>
      <p className="text-slate-400 text-sm mb-5">{item.brand} · {item.features}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <Stat label="List price" value={`₹${item.price.toLocaleString("en-IN")}`} />
        <Stat label="Rating" value={`${item.rating}★`} />
        {item.battery_life_hours && <Stat label="Battery" value={`${item.battery_life_hours}h`} />}
        {item.camera_score && <Stat label="Camera score" value={`${item.camera_score}/10`} />}
      </div>

      <div className="rounded-xl bg-navy-900 border border-navy-600 p-4 mb-2">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-slate-400 mb-1">Effective price after offer</p>
            <p className="font-mono text-3xl text-signal-amber font-semibold">
              <CountUp value={item.effective_price} prefix="₹" />
            </p>
          </div>
          {item.offer && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-1">
                {item.offer.bank} {item.offer.payment_method}
              </p>
              <p className="font-mono text-signal-cyan text-sm">
                −₹{item.benefit.toFixed(0)} ({savingsPct}% saved)
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-300 leading-relaxed text-sm mb-2">{item.explanation}</p>

      <ScoreBreakdown breakdown={item.breakdown} weights={item.weights} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">{label}</p>
      <p className="font-mono text-slate-100 text-sm">{value}</p>
    </div>
  );
}
