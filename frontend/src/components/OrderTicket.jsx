const PIPELINE = [
  { key: "parse_intent", label: "Reading the order" },
  { key: "search_products", label: "Checking the catalog" },
  { key: "rank_products", label: "Pricing it out" },
  { key: "generate_explanation", label: "Writing the receipt" },
];

export default function OrderTicket({ activeIndex, steps }) {
  if (activeIndex < 0) return null;

  return (
    <div className="border border-ink-600/70 rounded-sm p-5">
      <p className="font-mono text-[11px] tracking-[0.2em] text-paper/40 uppercase mb-4">
        Order ticket
      </p>
      <div className="flex flex-col gap-3">
        {PIPELINE.map((p, i) => {
          const done = i < activeIndex;
          const active = i === activeIndex;
          const stepData = steps?.find((s) => s.step === p.key);
          return (
            <div key={p.key} className="flex items-start gap-3 font-mono text-sm">
              <span className={`w-5 shrink-0 ${done || active ? "text-brass" : "text-paper/25"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={done ? "text-paper/90" : active ? "text-paper" : "text-paper/25"}>
                    {p.label}
                  </span>
                  {done && <span className="text-brass">✓</span>}
                  {active && <span className="text-brass animate-blink">▍</span>}
                </div>
                {done && stepData?.output && typeof stepData.output === "string" && (
                  <p className="text-paper/35 text-xs mt-0.5">{stepData.output}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
