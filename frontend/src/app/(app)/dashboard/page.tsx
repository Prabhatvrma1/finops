"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";

const fetchDashboardData = async (endpoint: string) => {
  const res = await fetch(`http://localhost:4000/api/dashboard/${endpoint}`);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
  const json = await res.json();
  return json.data;
};

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: kpis, isLoading: kpisLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: () => fetchDashboardData('kpis')
  });

  const { data: consumers, isLoading: consumersLoading } = useQuery({
    queryKey: ['top-consumers'],
    queryFn: () => fetchDashboardData('top-consumers')
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counters
      const counters = document.querySelectorAll(".counter");
      counters.forEach((counter) => {
        const target = parseFloat(counter.getAttribute("data-target") || "0");
        if (target > 0) {
          gsap.to(counter, {
            innerHTML: target,
            duration: 2,
            ease: "power2.out",
            snap: { innerHTML: 1 },
            onUpdate: function () {
              counter.innerHTML = Math.round(Number(this.targets()[0].innerHTML)).toLocaleString();
            },
          });
        }
      });

      // Sequential fade in for AI insights
      const insights = document.querySelectorAll(".insight-msg");
      gsap.to(insights, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 1.5,
        ease: "power2.out",
        delay: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-xl">
      {/* KPI Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Today */}
        <div className="glass-card p-lg flex flex-col justify-between h-32 glow-effect relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{kpis?.today?.label || "Today's Spend"}</span>
            <span className="material-symbols-outlined text-primary text-[20px]">{kpis?.today?.icon || 'today'}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-on-surface">$<span className="counter" data-target={kpis?.today?.value || "0"}>0</span></span>
            <span className={`font-label-sm flex items-center ${kpis?.today?.trendDirection === 'down' ? 'text-primary' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[14px]">
                {kpis?.today?.trendDirection === 'down' ? 'arrow_downward' : 'arrow_upward'}
              </span> 
              {Math.abs(kpis?.today?.trend || 0)}%
            </span>
          </div>
        </div>

        {/* Weekly */}
        <div className="glass-card p-lg flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{kpis?.weekly?.label || "7-Day Trailing"}</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">{kpis?.weekly?.icon || 'date_range'}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-on-surface">$<span className="counter" data-target={kpis?.weekly?.value || "0"}>0</span></span>
            <span className={`font-label-sm flex items-center ${kpis?.weekly?.trendDirection === 'down' ? 'text-primary' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[14px]">
                {kpis?.weekly?.trendDirection === 'down' ? 'arrow_downward' : 'arrow_upward'}
              </span> 
              {Math.abs(kpis?.weekly?.trend || 0)}%
            </span>
          </div>
        </div>

        {/* Monthly */}
        <div className="glass-card p-lg flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{kpis?.mtd?.label || "MTD Total"}</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">{kpis?.mtd?.icon || 'calendar_month'}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-on-surface">$<span className="counter" data-target={kpis?.mtd?.value || "0"}>0</span></span>
            <span className="font-label-sm text-on-surface-variant">{kpis?.mtd?.statusText || "on track"}</span>
          </div>
        </div>

        {/* Predicted */}
        <div className="glass-card p-lg flex flex-col justify-between h-32 relative overflow-hidden group border-primary/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent z-0"></div>
          <div className="flex justify-between items-start z-10">
            <span className="font-label-sm text-primary uppercase tracking-wider flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">{kpis?.forecast?.icon || 'auto_awesome'}</span> {kpis?.forecast?.label || 'AI Forecast (EOM)'}</span>
          </div>
          <div className="z-10 flex items-baseline gap-2">
            <span className="font-headline-xl font-bold text-primary text-glow">$<span className="counter" data-target={kpis?.forecast?.value || "0"}>0</span></span>
          </div>
        </div>
      </section>

      {/* Main Layout: Chart + AI Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Chart Area */}
        <div className="glass-card p-lg lg:col-span-2 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-md border-b border-white/5 pb-sm">
            <h3 className="font-title-md font-medium text-on-surface">30-Day Cost Trend</h3>
            <div className="flex gap-2">
              <span className="bg-primary-container/20 text-primary font-label-sm px-3 py-1 rounded-full cursor-pointer hover:bg-primary-container/40 transition-colors">Cumulative</span>
              <span className="text-on-surface-variant font-label-sm px-3 py-1 cursor-pointer hover:text-on-surface">Daily</span>
            </div>
          </div>
          <div className="flex-1 relative w-full h-full min-h-[300px] flex items-end">
            <div className="absolute inset-0 flex items-end pb-8">
              <svg className="w-full h-full drop-shadow-[0_0_15px_rgba(95,215,227,0.3)]" height="100%" preserveAspectRatio="none" viewBox="0 0 800 300" width="100%">
                <defs>
                  <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(95, 215, 227, 0.4)"></stop>
                    <stop offset="100%" stopColor="rgba(95, 215, 227, 0.0)"></stop>
                  </linearGradient>
                </defs>
                <path d="M0,300 L0,250 C100,220 200,280 300,200 C400,120 500,180 600,100 C700,20 750,80 800,50 L800,300 Z" fill="url(#chartGrad)"></path>
                <path d="M0,250 C100,220 200,280 300,200 C400,120 500,180 600,100 C700,20 750,80 800,50" fill="none" stroke="#5fd7e3" strokeWidth="3"></path>
                <path d="M600,100 L800,20" fill="none" stroke="#ffb4a3" strokeDasharray="5,5" strokeWidth="2"></path>
              </svg>
            </div>
            {/* X Axis Labels */}
            <div className="absolute bottom-0 w-full flex justify-between text-on-surface-variant font-label-sm px-4">
              <span>Oct 1</span>
              <span>Oct 8</span>
              <span>Oct 15</span>
              <span>Oct 22</span>
              <span>Oct 29</span>
            </div>
            {/* Hover Tooltip Simulator */}
            <div className="absolute left-[60%] top-[40%] bg-surface-container-high border border-outline-variant/50 p-2 rounded shadow-lg backdrop-blur-md transform -translate-x-1/2 -translate-y-full">
              <div className="font-label-sm text-on-surface-variant">Oct 18</div>
              <div className="font-body-md text-on-surface font-bold">$2,845.00</div>
            </div>
            <div className="absolute left-[60%] top-[40%] w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_#5fd7e3] transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-[60%] top-[40%] bottom-8 w-px bg-primary/30 border-dashed border-l"></div>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="glass-card p-lg flex flex-col relative overflow-hidden bg-gradient-to-b from-surface-container/60 to-surface/80">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">memory</span>
          </div>
          <div className="flex items-center gap-sm mb-md border-b border-primary/20 pb-sm">
            <span className="material-symbols-outlined text-primary animate-pulse">psychology</span>
            <h3 className="font-title-md font-medium text-primary">Copilot Insights</h3>
          </div>
          <div className="flex-1 space-y-md font-body-md text-on-surface/90 overflow-y-auto pr-2" id="typewriter-container">
            <div className="insight-msg p-3 bg-surface-container-high/50 rounded-lg border border-white/5 opacity-0 translate-y-4">
              <p className="text-sm"><strong className="text-tertiary">Anomaly Detected:</strong> EKS Cluster <code className="bg-black/30 px-1 rounded text-primary">us-east-prod-1</code> experienced a 45% spend spike over the last 12 hours.</p>
            </div>
            <div className="insight-msg p-3 bg-surface-container-high/50 rounded-lg border border-white/5 opacity-0 translate-y-4">
              <p className="text-sm"><strong className="text-secondary">Recommendation:</strong> Downscale unused node groups in <code className="bg-black/30 px-1 rounded text-primary">us-west-dev</code>. Estimated savings: $450/mo.</p>
            </div>
            <div className="insight-msg p-3 bg-primary/10 rounded-lg border border-primary/20 opacity-0 translate-y-4">
              <p className="text-sm flex items-center gap-2"><span className="material-symbols-outlined text-[16px] text-primary">auto_fix_high</span> Generating optimization script...</p>
            </div>
          </div>
          <div className="mt-md pt-sm border-t border-white/5">
            <div className="flex bg-surface-container-lowest rounded-md border-b-2 border-transparent focus-within:border-primary transition-colors p-1">
              <input className="bg-transparent border-none focus:ring-0 text-label-sm w-full outline-none px-2 text-on-surface" placeholder="Ask AI about your spend..." type="text" />
              <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors"><span className="material-symbols-outlined text-[18px]">send</span></button>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Row: Table & Treemap */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Resource Table */}
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
                {consumersLoading ? (
                  <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
                ) : consumers?.map((c: any, i: number) => {
                  const colors = ['bg-error', 'bg-primary', 'bg-on-surface-variant', 'bg-secondary', 'bg-tertiary'];
                  const colorClass = colors[i % colors.length];
                  return (
                    <tr key={i} className="border-b border-white/5 hover:bg-primary/5 transition-colors group">
                      <td className="p-4 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                        {c.name}
                      </td>
                      <td className="p-4 text-on-surface-variant">{c.service}</td>
                      <td className="p-4 text-right font-medium">${c.cost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className={`p-4 text-right flex items-center justify-end gap-1 ${c.trendDirection === 'up' ? 'text-error' : c.trendDirection === 'down' ? 'text-primary' : 'text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[16px]">
                          {c.trendDirection === 'up' ? 'trending_up' : c.trendDirection === 'down' ? 'trending_down' : 'trending_flat'}
                        </span> 
                        {c.trend > 0 ? '+' : ''}{c.trend}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CSS Treemap Proxy */}
        <div className="glass-card p-lg flex flex-col h-full">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-title-md font-medium text-on-surface">Cost by Region</h3>
            <span className="material-symbols-outlined text-on-surface-variant">public</span>
          </div>
          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 rounded-lg overflow-hidden">
            <div className="col-span-2 row-span-2 bg-primary/20 border border-primary/30 p-3 flex flex-col justify-between hover:bg-primary/30 transition-colors cursor-pointer relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="font-label-sm text-on-surface-variant">us-east-1</span>
              <div>
                <div className="font-title-md font-bold">45%</div>
                <div className="font-label-sm text-primary">$40,243</div>
              </div>
            </div>
            <div className="col-span-1 row-span-1 bg-secondary/20 border border-secondary/30 p-3 flex flex-col justify-between hover:bg-secondary/30 transition-colors cursor-pointer">
              <span className="font-label-sm text-on-surface-variant">eu-west-1</span>
              <div>
                <div className="font-title-md font-bold">25%</div>
                <div className="font-label-sm text-secondary">$22,357</div>
              </div>
            </div>
            <div className="col-span-1 row-span-1 grid grid-cols-2 gap-2">
              <div className="bg-tertiary/20 border border-tertiary/30 p-2 flex flex-col justify-end hover:bg-tertiary/30 transition-colors cursor-pointer">
                <span className="font-label-sm text-[10px] text-on-surface-variant leading-none">ap-south</span>
                <div className="font-body-md font-bold leading-none mt-1">15%</div>
              </div>
              <div className="bg-outline-variant/30 border border-outline-variant/50 p-2 flex flex-col justify-end hover:bg-outline-variant/50 transition-colors cursor-pointer">
                <span className="font-label-sm text-[10px] text-on-surface-variant leading-none">other</span>
                <div className="font-body-md font-bold leading-none mt-1">15%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
