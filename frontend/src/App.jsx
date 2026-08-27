import { useState, useRef } from "react";
import OrderTicket from "./components/OrderTicket";
import DecisionReceipt from "./components/DecisionReceipt";
import AlternativesList from "./components/AlternativesList";
import ComparisonChart from "./components/ComparisonChart";
import AgentConsole from "./components/AgentConsole";
import { askPayPilot } from "./api";

const EXAMPLES = [
  "Wireless headphones under ₹8000 for travel, maximize cashback",
  "Earbuds under ₹3000 with the best battery life",
  "Laptop under ₹70000, best rating",
  "Phone under ₹25000 for photography",
];

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  async function handleAsk(q) {
    const finalQuery = q ?? query;
    if (!finalQuery.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setStepIndex(0);

    let i = 0;
    timerRef.current = setInterval(() => {
      i += 1;
      if (i <= 2) setStepIndex(i);
    }, 550);

    try {
      const data = await askPayPilot(finalQuery);
      clearInterval(timerRef.current);
      setStepIndex(4);
      setResult(data);
    } catch (e) {
      clearInterval(timerRef.current);
      setError("Couldn't reach the PayPilot backend. Is the API running?");
      setStepIndex(-1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-paper font-body">
      <div className="max-w-6xl mx-auto px-5 pt-14 pb-24">
        <header className="mb-12 text-center">
          <p className="font-mono text-[11px] tracking-[0.3em] text-brass uppercase mb-3">
            AI Commerce &amp; Payment Agent
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-paper font-medium mb-4">
            Pay<span className="italic text-brass">Pilot</span>
          </h1>
          <p className="text-paper/50 max-w-lg mx-auto text-[15px]">
            Tell it what you want. It checks the catalog, prices out the offers,
            and hands you back a decision — printed like a receipt, not buried in a list.
          </p>
        </header>

        <div className="grid md:grid-cols-[1fr_1.1fr] gap-10 items-start">
          {/* Left: the counter */}
          <div className="flex flex-col gap-5">
            <div className="border border-ink-600/70 rounded-sm bg-ink-800/30 p-2 flex items-center gap-2">
              <span className="pl-3 font-mono text-brass select-none">›</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                placeholder="What are you looking for?"
                className="flex-1 bg-transparent outline-none py-3 text-paper placeholder:text-paper/30 font-body text-sm"
              />
              <button
                onClick={() => handleAsk()}
                disabled={loading}
                className="rounded-sm bg-brass text-ink-950 font-display font-semibold px-5 py-2.5 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-50 text-sm"
              >
                {loading ? "Working…" : "Ask PayPilot"}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => {
                    setQuery(ex);
                    handleAsk(ex);
                  }}
                  className="text-[11px] font-mono text-paper/40 border border-ink-600/60 rounded-full px-3 py-1.5 hover:border-brass hover:text-brass transition"
                >
                  {ex}
                </button>
              ))}
            </div>

            {stepIndex >= 0 && <OrderTicket activeIndex={stepIndex} steps={result?.steps} />}

            {error && (
              <div className="rounded-sm border border-stamp/50 bg-stamp/10 text-stamp text-sm p-4">
                {error}
              </div>
            )}

            {result?.message && (
              <div className="rounded-sm border border-ink-600/50 bg-ink-800/40 text-paper/60 text-sm p-4">
                {result.message}
              </div>
            )}
          </div>

          {/* Right: the receipt */}
          <div>
            {result?.recommendation ? (
              <>
                <DecisionReceipt item={result.recommendation} alternatives={result.alternatives} />
                <AlternativesList items={result.alternatives} />
                <ComparisonChart winner={result.recommendation} alternatives={result.alternatives} />
                <AgentConsole steps={result.steps} />
              </>
            ) : (
              <div className="hidden md:flex items-center justify-center h-full min-h-[300px] border border-dashed border-ink-600/50 rounded-sm">
                <p className="font-mono text-paper/25 text-xs text-center px-8">
                  the receipt prints here<br />once PayPilot has decided
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-paper/25 pb-8 font-mono">
        Built as an agentic commerce demo · offers are synthetic, not live bank data
      </footer>
    </div>
  );
}
