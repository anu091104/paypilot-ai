import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ComparisonChart({ winner, alternatives }) {
  if (!winner) return null;
  const all = [winner, ...(alternatives || [])].slice(0, 5);

  const data = all.map((item) => ({
    name: item.name.length > 14 ? item.name.slice(0, 13) + "…" : item.name,
    listPrice: item.price,
    effectivePrice: item.effective_price,
    isWinner: item.id === winner.id,
  }));

  return (
    <div className="animate-rise mt-6 max-w-md mx-auto rounded-sm border border-ink-600/50 bg-ink-800/30 p-5">
      <p className="font-mono text-[11px] tracking-[0.2em] text-paper/40 uppercase mb-4">
        Price ledger across candidates
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fill: "#F6F1E4", fillOpacity: 0.4, fontSize: 10 }} axisLine={{ stroke: "#3B332A" }} tickLine={false} />
          <YAxis tick={{ fill: "#F6F1E4", fillOpacity: 0.4, fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#1C1815", border: "1px solid #3B332A", borderRadius: 2, fontSize: 12 }}
            labelStyle={{ color: "#F6F1E4" }}
            itemStyle={{ color: "#F6F1E4" }}
            formatter={(value, key) => [`₹${value.toLocaleString("en-IN")}`, key === "listPrice" ? "List price" : "Effective price"]}
          />
          <Bar dataKey="listPrice" fill="#3B332A" radius={[2, 2, 0, 0]} />
          <Bar dataKey="effectivePrice" radius={[2, 2, 0, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.isWinner ? "#B8894A" : "#6b5f4d"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-[10px] text-paper/40 font-mono">
        <span><span className="inline-block w-2 h-2 rounded-full bg-ink-600 mr-1.5" />List price</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-brass mr-1.5" />Winner</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-[#6b5f4d] mr-1.5" />Others</span>
      </div>
    </div>
  );
}
