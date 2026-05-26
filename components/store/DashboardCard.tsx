export function DashboardCard({
  title, value, sub, trend,
}: { title: string; value: string | number; sub?: string; trend?: { delta: number; positive: boolean } }) {
  return (
    <div style={{ border: "1px solid var(--color-hair)", borderRadius: 4, padding: 16, background: "var(--color-cream, #fdfaf3)" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-rust, #9A8A72)" }}>{title}</div>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginTop: 4 }}>
        <div className="serif" style={{ fontSize: 28 }}>{value}</div>
        {trend && (
          <span style={{ fontSize: 11, color: trend.positive ? "#5b7a3a" : "#a64545" }}>
            {trend.positive ? "↑" : "↓"} {Math.abs(trend.delta)} / 7d
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11, color: "var(--color-rust, #6b5d44)", marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
