import { useState } from "react";
import CountUp from "./CountUp";

function Leader({ label, value, sub }) {
  return (
    <div className="flex items-baseline">
      <span className="text-[13px]">{label}</span>
      <span className="leader" />
      <span className="tabular text-[13px] text-right">
        {value}
        {sub && <span className="text-ink-700/60 text-[11px] ml-1">{sub}</span>}
      </span>
    </div>
  );
}

function CustomerCopy({ item }) {
  const savingsPct = item.price ? Math.round((item.benefit / item.price) * 100) : 0;
  const b = item.breakdown || {};

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.25em] text-ink-700/50 mb-1">CUSTOMER COPY</p>
      <h2 className="font-display text-[26px] leading-tight text-ink-900 font-medium mb-1">
        {item.name}
      </h2>
      <p className="font-mono text-[11px] text-ink-700/60 mb-5">{item.brand} · {item.category}</p>

      <div className="flex flex-col gap-2 text-ink-800 mb-4">
        <Leader label="List price" value={`₹${item.price.toLocaleString("en-IN")}`} />
        {item.offer && (
          <Leader
            label={`Offer applied (${item.offer.bank} ${item.offer.payment_method})`}
            value={`−₹${item.benefit.toFixed(0)}`}
          />
        )}
        <Leader label="Rating" value={`${item.rating} / 5`} />
        {item.battery_life_hours && <Leader label="Battery" value={`${item.battery_life_hours}h`} />}
        {item.camera_score && <Leader label="Camera score" value={`${item.camera_score} / 10`} />}
      </div>

      <div className="border-t-2 border-dashed border-ink-700/25 pt-3 mb-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs tracking-widest text-ink-700/60 uppercase">Effective price</span>
          <span className="font-mono text-3xl text-ink-900 font-semibold tabular">
            <CountUp value={item.effective_price} prefix="₹" />
          </span>
        </div>
        {item.benefit > 0 && (
          <p className="text-right font-mono text-xs text-stamp mt-1">you saved {savingsPct}%</p>
        )}
      </div>

      <p className="text-[13px] text-ink-800/80 leading-relaxed italic mb-5">
        "{item.explanation}"
      </p>

      {b && Object.keys(b).length > 0 && (
        <div className="border-t border-dotted border-ink-700/30 pt-4">
          <p className="font-mono text-[11px] tracking-[0.2em] text-ink-700/50 uppercase mb-2.5">
            Match breakdown
          </p>
          <div className="flex flex-col gap-1.5">
            <Leader label="Price fit" value={`${b.price}%`} />
            <Leader label="Rating" value={`${b.rating}%`} />
            <Leader label="Your priority" value={`${b.priority}%`} />
            <Leader label="Cashback" value={`${b.cashback}%`} />
          </div>
        </div>
      )}
    </>
  );
}

function MerchantCopy({ item, alternatives }) {
  const candidates = [item, ...(alternatives || [])];
  const avgOfferPct = Math.round(
    (candidates.reduce((sum, c) => sum + (c.benefit / c.price), 0) / candidates.length) * 100
  );
  const frictionStepsRemoved = 5; // search, compare specs, hunt offers, calculate, decide
  const offerUtilization = Math.round(
    (candidates.filter((c) => c.benefit > 0).length / candidates.length) * 100
  );
  const decisionConfidence = item.score;

  return (
    <>
      <p className="font-mono text-[11px] tracking-[0.25em] text-ink-700/50 mb-1">MERCHANT COPY</p>
      <h2 className="font-display text-[22px] leading-tight text-ink-900 font-medium mb-4">
        Why this checkout converts
      </h2>

      <div className="flex flex-col gap-2.5 mb-5">
        <Leader label="Manual comparison steps removed" value={frictionStepsRemoved} sub="per session" />
        <Leader label="Candidates with an active offer" value={`${offerUtilization}%`} />
        <Leader label="Avg. discount surfaced" value={`${avgOfferPct}%`} sub="of list price" />
        <Leader label="Recommendation confidence" value={`${decisionConfidence}/100`} />
      </div>

      <div className="border-t-2 border-dashed border-ink-700/25 pt-3 mb-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs tracking-widest text-ink-700/60 uppercase">Checkout price shown</span>
          <span className="font-mono text-3xl text-ink-900 font-semibold tabular">
            <CountUp value={item.effective_price} prefix="₹" />
          </span>
        </div>
        <p className="text-right font-mono text-xs text-stamp mt-1">
          vs. ₹{item.price.toLocaleString("en-IN")} sticker price
        </p>
      </div>

      <p className="text-[12px] text-ink-800/70 leading-relaxed">
        The agent surfaces the best available payment offer at the moment of decision,
        instead of leaving discovery to the customer post-checkout — the offer becomes
        a reason to convert, not a coupon they find later.
      </p>
      <p className="text-[10px] text-ink-700/45 mt-4 font-mono">
        * illustrative metrics from this session's candidate set, for demo purposes
      </p>
    </>
  );
}

export default function DecisionReceipt({ item, alternatives }) {
  const [copy, setCopy] = useState("customer");
  if (!item) return null;

  return (
    <div className="animate-printOut w-full max-w-md mx-auto">
      <div className="relative">
        <div className="perforation" />
        <div className="bg-paper px-7 pt-6 pb-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">
          <div className="flex justify-center mb-5">
            <div className="inline-flex rounded-full border border-ink-700/20 p-0.5 font-mono text-[11px]">
              <button
                onClick={() => setCopy("customer")}
                className={`px-3 py-1 rounded-full transition ${
                  copy === "customer" ? "bg-ink-900 text-paper" : "text-ink-700/60"
                }`}
              >
                Customer copy
              </button>
              <button
                onClick={() => setCopy("merchant")}
                className={`px-3 py-1 rounded-full transition ${
                  copy === "merchant" ? "bg-ink-900 text-paper" : "text-ink-700/60"
                }`}
              >
                Merchant copy
              </button>
            </div>
          </div>

          {copy === "customer" ? (
            <CustomerCopy item={item} />
          ) : (
            <MerchantCopy item={item} alternatives={alternatives} />
          )}

          <div className="mt-6 flex justify-center">
            <div className="animate-stampIn border-[3px] border-stamp text-stamp rounded-full w-24 h-24 flex items-center justify-center -rotate-[8deg]">
              <span className="font-display font-semibold text-xs tracking-widest text-center leading-tight">
                PAYPILOT<br />APPROVED
              </span>
            </div>
          </div>
        </div>
        <div className="perforation" />
      </div>
    </div>
  );
}
