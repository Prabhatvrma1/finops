"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const fetchData = async (endpoint: string) => {
  const res = await fetch(`${API_BASE}/api/dashboard/${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  const json = await res.json();
  return json.data;
};


interface Consumer {
  name: string;
  service: string;
  cost: number;
  trend: number;
  trendDirection: string;
}

interface Region {
  name: string;
  cost: number;
  percentage: number;
}

interface TrendPoint {
  date: string;
  dateLabel: string;
  dailyCost: number;
  cumulative: number;
}

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartMode, setChartMode] = useState<"cumulative" | "daily">("cumulative");

  const { data: kpis } = useQuery({ queryKey: ["kpis"], queryFn: () => fetchData("kpis") });
  const { data: consumers } = useQuery({ queryKey: ["top-consumers"], queryFn: () => fetchData("top-consumers") });
  const { data: regions } = useQuery({ queryKey: ["regions"], queryFn: () => fetchData("regions") });
  const { data: trend } = useQuery({ queryKey: ["cost-trend"], queryFn: () => fetchData("cost-trend") });
  const { data: insights } = useQuery({ queryKey: ["insights"], queryFn: () => fetchData("insights") });

  // Animations
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".kpi-card", { opacity: 0, y: 30, duration: 0.7, stagger: 0.12, ease: "power3.out" });
      gsap.from(".chart-panel", { opacity: 0, y: 20, duration: 0.8, delay: 0.4, ease: "power2.out" });
      gsap.from(".insight-msg", { opacity: 0, y: 15, duration: 0.6, stagger: 0.8, delay: 1.2, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [kpis]);

  // Build SVG path from trend data
  const buildChartPath = () => {
    if (!trend?.actual?.length) return { line: "", area: "", labels: [], forecast: "" };

    const points: TrendPoint[] = trend.actual;
    const forecastPts: TrendPoint[] = trend.forecast || [];
    const allPoints = [...points, ...forecastPts];
    const key = chartMode === "cumulative" ? "cumulative" : "dailyCost";

    const maxVal = Math.max(...allPoints.map((p: TrendPoint) => (p as Record<string, number>)[key]));
    const minVal = Math.min(...allPoints.map((p: TrendPoint) => (p as Record<string, number>)[key]));
    const range = maxVal - minVal || 1;

    const w = 800, h = 280, pad = 10;
    const scaleX = (i: number) => pad + (i / (allPoints.length - 1)) * (w - 2 * pad);
    const scaleY = (v: number) => pad + (1 - (v - minVal) / range) * (h - 2 * pad);

    let line = "";
    points.forEach((p, i) => {
      const x = scaleX(i);
      const y = scaleY((p as Record<string, number>)[key]);
      line += i === 0 ? `M${x},${y}` : ` L${x},${y}`;
    });

    const lastActualIdx = points.length - 1;
    let forecast = "";
    if (forecastPts.length > 0) {
      forecast = `M${scaleX(lastActualIdx)},${scaleY((points[lastActualIdx] as Record<string, number>)[key])}`;
      forecastPts.forEach((p, i) => {
        const x = scaleX(lastActualIdx + 1 + i);
        const y = scaleY((p as Record<string, number>)[key]);
        forecast += ` L${x},${y}`;
      });
    }

    // Area fill under the actual line
    const area = `${line} L${scaleX(lastActualIdx)},${h - pad} L${scaleX(0)},${h - pad} Z`;

    // X-axis labels (every 5th point)
    const labels = points
      .filter((_, i) => i % 6 === 0 || i === points.length - 1)
      .map((p) => ({
        label: p.dateLabel,
        x: scaleX(points.indexOf(p)),
        y: h + 5
      }));

    return { line, area, forecast, labels };
  };

  const chart = buildChartPath();

  const formatCost = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
    return val.toLocaleString();
  };

  const regionColors = [
    { bg: "bg-primary/20", border: "border-primary/30", hover: "hover:bg-primary/30", text: "text-primary" },
    { bg: "bg-secondary/20", border: "border-secondary/30", hover: "hover:bg-secondary/30", text: "text-secondary" },
    { bg: "bg-tertiary/20", border: "border-tertiary/30", hover: "hover:bg-tertiary/30", text: "text-tertiary" },
    { bg: "bg-outline-variant/30", border: "border-outline-variant/50", hover: "hover:bg-outline-variant/50", text: "text-on-surface-variant" },
  ];

  return (
    <div ref={containerRef} className="space-y-xl pb-16">
      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Today */}
        <div className="kpi-card glass-card p-lg flex flex-col justify-between h-32 glow-effect relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{kpis?.today?.label || "Today's Spend"}</span>
            <span className="material-symbols-outlined text-primary text-[20px]">{kpis?.today?.icon || "today"}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-on-surface">${formatCost(kpis?.today?.value || 0)}</span>
            <span className={`font-label-sm flex items-center ${kpis?.today?.trendDirection === "down" ? "text-primary" : "text-error"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {kpis?.today?.trendDirection === "down" ? "arrow_downward" : "arrow_upward"}
              </span>
              {Math.abs(kpis?.today?.trend || 0)}%
            </span>
          </div>
        </div>

        {/* Weekly */}
        <div className="kpi-card glass-card p-lg flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{kpis?.weekly?.label || "7-Day Trailing"}</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">{kpis?.weekly?.icon || "date_range"}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-on-surface">${formatCost(kpis?.weekly?.value || 0)}</span>
            <span className={`font-label-sm flex items-center ${kpis?.weekly?.trendDirection === "down" ? "text-primary" : "text-error"}`}>
              <span className="material-symbols-outlined text-[14px]">
                {kpis?.weekly?.trendDirection === "down" ? "arrow_downward" : "arrow_upward"}
              </span>
              {Math.abs(kpis?.weekly?.trend || 0)}%
            </span>
          </div>
        </div>

        {/* MTD */}
        <div className="kpi-card glass-card p-lg flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{kpis?.mtd?.label || "MTD Total"}</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">{kpis?.mtd?.icon || "calendar_month"}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-on-surface">${formatCost(kpis?.mtd?.value || 0)}</span>
            <span className="font-label-sm text-on-surface-variant">{kpis?.mtd?.statusText || "on track"}</span>
          </div>
        </div>

        {/* AI Forecast */}
        <div className="kpi-card glass-card p-lg flex flex-col justify-between h-32 relative overflow-hidden group border-primary/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-primary uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">{kpis?.forecast?.icon || "auto_awesome"}</span>
              {kpis?.forecast?.label || "AI Forecast (EOM)"}
            </span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-primary text-glow">${formatCost(kpis?.forecast?.value || 0)}</span>
          </div>
        </div>
      </section>

      {/* Main Layout: Chart + AI Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Chart Area */}
        <div className="chart-panel glass-card p-lg lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-md border-b border-white/5 pb-sm">
            <h3 className="font-title-md font-medium text-on-surface">30-Day Cost Trend</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setChartMode("cumulative")}
                className={`font-label-sm px-3 py-1 rounded-full cursor-pointer transition-colors ${chartMode === "cumulative" ? "bg-primary-container/20 text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Cumulative
              </button>
              <button
                onClick={() => setChartMode("daily")}
                className={`font-label-sm px-3 py-1 rounded-full cursor-pointer transition-colors ${chartMode === "daily" ? "bg-primary-container/20 text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Daily
              </button>
            </div>
          </div>
          <div className="flex-1 relative w-full min-h-[300px]">
            <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(95,215,227,0.3)]" preserveAspectRatio="none" viewBox="0 0 800 290">
              <defs>
                <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgba(95, 215, 227, 0.4)"></stop>
                  <stop offset="100%" stopColor="rgba(95, 215, 227, 0.0)"></stop>
                </linearGradient>
              </defs>
              {chart.area && <path d={chart.area} fill="url(#chartGrad)" />}
              {chart.line && <path d={chart.line} fill="none" stroke="#5fd7e3" strokeWidth="2.5" />}
              {chart.forecast && <path d={chart.forecast} fill="none" stroke="#ffb4a3" strokeDasharray="6,4" strokeWidth="2" />}
            </svg>
            {/* X Axis Labels */}
            <div className="absolute bottom-0 w-full flex justify-between text-on-surface-variant font-label-sm px-4">
              {chart.labels?.map((l, i) => <span key={i}>{l.label}</span>)}
            </div>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="chart-panel glass-card p-lg flex flex-col relative overflow-hidden bg-gradient-to-b from-surface-container/60 to-surface/80">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">memory</span>
          </div>
          <div className="flex items-center gap-sm mb-md border-b border-primary/20 pb-sm">
            <span className="material-symbols-outlined text-primary animate-pulse">psychology</span>
            <h3 className="font-title-md font-medium text-primary">Copilot Insights</h3>
          </div>
          <div className="flex-1 space-y-md font-body-md text-on-surface/90 overflow-y-auto pr-2">
            {(insights || []).map((insight: { type: string; severity?: string; message: string; savings?: number; icon?: string }, i: number) => (
              <div
                key={i}
                className={`insight-msg p-3 rounded-lg border ${
                  insight.type === "anomaly"
                    ? "bg-error/10 border-error/20"
                    : insight.type === "action"
                    ? "bg-primary/10 border-primary/20"
                    : "bg-surface-container-high/50 border-white/5"
                }`}
              >
                <p className="text-sm" dangerouslySetInnerHTML={{
                  __html: `<strong class="${
                    insight.type === "anomaly" ? "text-tertiary" : insight.type === "action" ? "text-primary" : "text-secondary"
                  }">${insight.type === "anomaly" ? "Anomaly Detected:" : insight.type === "action" ? "⚡ Action:" : "Recommendation:"}</strong> ${insight.message}`
                }} />
                {insight.savings && insight.savings > 0 && (
                  <span className="mt-2 inline-block bg-primary/10 text-primary font-label-sm px-2 py-0.5 rounded-full">
                    Save ~${insight.savings}/mo
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-md pt-sm border-t border-white/5">
            <div className="flex bg-surface-container-lowest rounded-md border-b-2 border-transparent focus-within:border-primary transition-colors p-1">
              <input className="bg-transparent border-none focus:ring-0 text-label-sm w-full outline-none px-2 text-on-surface" placeholder="Ask AI about your spend..." type="text" />
              <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Table & Regions */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Top Consumer Table */}
        <div className="glass-card p-0 flex flex-col overflow-hidden">
          <div className="p-lg border-b border-white/5">
            <h3 className="font-title-md font-medium text-on-surface">Top Consumers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/30 border-b border-white/5">
                  <th className="p-4 font-label-sm text-on-surface-variant uppercase">Resource</th>
                  <th className="p-4 font-label-sm text-on-surface-variant uppercase">Service</th>
                  <th className="p-4 font-label-sm text-on-surface-variant uppercase text-right">Cost (MTD)</th>
                  <th className="p-4 font-label-sm text-on-surface-variant uppercase text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-on-surface">
                {(consumers || []).map((c: Consumer, i: number) => {
                  const colors = ["bg-error", "bg-primary", "bg-on-surface-variant", "bg-secondary", "bg-tertiary", "bg-outline-variant"];
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-primary/5 transition-colors group">
                      <td className="p-4 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colors[i % colors.length]}`}></div>
                        <span className="font-mono text-sm">{c.name}</span>
                      </td>
                      <td className="p-4 text-on-surface-variant">{c.service}</td>
                      <td className="p-4 text-right font-medium">${c.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className={`p-4 text-right ${c.trendDirection === "up" ? "text-error" : c.trendDirection === "down" ? "text-primary" : "text-on-surface-variant"}`}>
                        <span className="flex items-center justify-end gap-1">
                          <span className="material-symbols-outlined text-[16px]">
                            {c.trendDirection === "up" ? "trending_up" : c.trendDirection === "down" ? "trending_down" : "trending_flat"}
                          </span>
                          {c.trend > 0 ? "+" : ""}{c.trend}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cost by Region - Dynamic */}
        <div className="glass-card p-lg flex flex-col h-full">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-title-md font-medium text-on-surface">Cost by Region</h3>
            <span className="material-symbols-outlined text-on-surface-variant">public</span>
          </div>
          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 rounded-lg overflow-hidden">
            {(regions || []).map((r: Region, i: number) => {
              const color = regionColors[i % regionColors.length];
              const isLarge = i === 0;
              return (
                <div
                  key={r.name}
                  className={`${isLarge ? "col-span-2 row-span-2" : ""} ${color.bg} ${color.border} border p-3 flex flex-col justify-between ${color.hover} transition-colors cursor-pointer relative group`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <span className="font-label-sm text-on-surface-variant">{r.name}</span>
                  <div>
                    <div className="font-title-md font-bold">{r.percentage}%</div>
                    <div className={`font-label-sm ${color.text}`}>${r.cost.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
