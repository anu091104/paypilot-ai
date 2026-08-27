const PIPELINE = [
  { key: "parse_intent", label: "Understanding request" },
  { key: "search_products", label: "Searching products" },
  { key: "rank_products", label: "Comparing offers & ranking" },
  { key: "generate_explanation", label: "Building recommendation" },
];

export default function AgentTrace({ activeIndex, steps }) {
  return (
    <div className="flex flex-col gap-3 font-mono text-sm">
      {PIPELINE.map((p, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const stepData = steps?.find((s) => s.step === p.key);
        return (
          <div
            key={p.key}
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              i > activeIndex ? "opacity-30" : "opacity-100"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                done ? "bg-signal-cyan" : active ? "bg-signal-amber animate-pulseStep" : "bg-navy-600"
              }`}
            />
            <span className={done || active ? "text-slate-200" : "text-slate-500"}>
              {p.label}
            </span>
            {done && stepData?.output && typeof stepData.output === "string" && (
              <span className="text-slate-500 text-xs ml-1">— {stepData.output}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
