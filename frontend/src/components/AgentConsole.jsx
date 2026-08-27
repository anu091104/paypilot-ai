import { useState } from "react";

function formatStep(step) {
  if (typeof step.output === "string") return step.output;
  try {
    return JSON.stringify(step.output);
  } catch {
    return String(step.output);
  }
}

export default function AgentConsole({ steps }) {
  const [open, setOpen] = useState(false);
  if (!steps || steps.length === 0) return null;

  return (
    <div className="animate-rise mt-6 max-w-md mx-auto rounded-sm border border-ink-600/50 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink-800/40 transition font-mono text-[11px] tracking-[0.15em] uppercase"
      >
        <span className="text-paper/40">Full audit trail</span>
        <span className="text-brass">{open ? "hide ▲" : "show ▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto bg-ink-950/60">
          {steps.map((s, i) => (
            <div key={i} className="mb-2 pt-2">
              <span className="text-brass">[{i + 1}]</span>{" "}
              <span className="text-paper/70">{s.step}</span>
              <span className="text-paper/25"> → </span>
              <span className="text-paper/50 break-words">{formatStep(s)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
