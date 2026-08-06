"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const fetchInfra = async () => {
  const res = await fetch(`${API_BASE}/api/dashboard/infrastructure`);
  if (!res.ok) throw new Error("Failed to fetch infrastructure data");
  const json = await res.json();
  return json.data;
};

interface Namespace {
  name: string;
  pods: number;
  status: string;
}

interface Cluster {
  name: string;
  provider: string;
  region: string;
  status: string;
  nodes: number;
  pods: number;
  cpuUsage: number;
  memoryUsage: number;
  namespaces: Namespace[];
}

interface DriftItem {
  resource: string;
  status: string;
  context: { type: string; value: string }[];
}

export default function InfrastructurePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCluster, setSelectedCluster] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const { data, refetch } = useQuery({ queryKey: ["infrastructure"], queryFn: fetchInfra });

  const clusters: Cluster[] = data?.topology || [];
  const carbon = data?.carbon || { currentEmissions: 0, unit: "tCO2e", weeklyChange: 0 };
  const driftItems: DriftItem[] = data?.drift || [];
  const cluster = clusters[selectedCluster];

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".stagger-fade-in", { opacity: 0, y: 20, duration: 0.8, stagger: 0.15, ease: "power2.out" });
    }, containerRef);
    return () => ctx.revert();
  }, [data]);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    refetch();
    setSyncing(false);
  };

  const usageColor = (pct: number) => {
    if (pct > 80) return "text-error";
    if (pct > 60) return "text-tertiary";
    return "text-primary";
  };

  return (
    <div ref={containerRef} className="space-y-xl pb-16">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 stagger-fade-in">
        <div>
          <h2 className="font-headline-xl font-bold text-primary">Infrastructure &amp; Forecast</h2>
          <p className="font-body-lg text-on-surface-variant mt-sm">Real-time topology, drift detection, and emissions tracking.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary rounded-lg font-label-sm hover:bg-primary/10 transition-colors flex items-center gap-2 cursor-pointer active:scale-95">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-sm hover:bg-primary transition-colors flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[18px] ${syncing ? "animate-spin" : ""}`}>refresh</span>
            {syncing ? "Syncing..." : "Sync State"}
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter stagger-fade-in">
        {/* K8s Topology Map */}
        <section className="md:col-span-8 glass-card p-lg flex flex-col relative overflow-hidden min-h-[420px]">
          <div className="flex justify-between items-center mb-md z-10 relative">
            <h3 className="font-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lan</span>
              Kubernetes Topology
            </h3>
            <div className="flex items-center gap-2">
              {clusters.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCluster(i)}
                  className={`px-3 py-1 rounded-full font-label-sm cursor-pointer transition-colors ${
                    i === selectedCluster ? "bg-primary/15 text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {c.name}
                </button>
              ))}
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary rounded-full font-label-sm ml-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live
              </span>
            </div>
          </div>

          {cluster ? (
            <div className="flex-1 flex flex-col gap-4">
              {/* Cluster Stats Bar */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-surface-container/50 rounded-lg p-3 text-center border border-white/5">
                  <div className="font-headline-lg font-bold text-on-surface">{cluster.nodes}</div>
                  <div className="font-label-sm text-on-surface-variant">Nodes</div>
                </div>
                <div className="bg-surface-container/50 rounded-lg p-3 text-center border border-white/5">
                  <div className="font-headline-lg font-bold text-on-surface">{cluster.pods}</div>
                  <div className="font-label-sm text-on-surface-variant">Pods</div>
                </div>
                <div className="bg-surface-container/50 rounded-lg p-3 text-center border border-white/5">
                  <div className={`font-headline-lg font-bold ${usageColor(cluster.cpuUsage)}`}>{cluster.cpuUsage}%</div>
                  <div className="font-label-sm text-on-surface-variant">CPU</div>
                </div>
                <div className="bg-surface-container/50 rounded-lg p-3 text-center border border-white/5">
                  <div className={`font-headline-lg font-bold ${usageColor(cluster.memoryUsage)}`}>{cluster.memoryUsage}%</div>
                  <div className="font-label-sm text-on-surface-variant">Memory</div>
                </div>
              </div>

              {/* Namespace Grid */}
              <div className="flex-1 border border-white/5 rounded-lg bg-surface-container-low/50 p-4">
                <div className="font-label-sm text-on-surface-variant mb-3 uppercase tracking-wider">Namespaces</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cluster.namespaces.map((ns) => (
                    <div key={ns.name} className="bg-surface-container/50 rounded-lg p-3 border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm text-on-surface">{ns.name}</span>
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                      </div>
                      <div className="font-label-sm text-on-surface-variant">{ns.pods} pods</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="font-label-sm text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">info</span>
                {cluster.provider} • {cluster.region} • Status: {cluster.status}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] text-primary/30 mb-2">hub</span>
              <p className="font-label-sm">Loading cluster topology...</p>
            </div>
          )}
        </section>

        {/* Carbon Tracker */}
        <section className="md:col-span-4 glass-card p-lg flex flex-col relative overflow-hidden">
          <h3 className="font-title-md text-on-surface flex items-center gap-2 mb-md relative z-10">
            <span className="material-symbols-outlined text-[#0FA4AF]">eco</span>
            Carbon Footprint
          </h3>
          <div className="flex-1 relative border border-white/5 rounded-lg bg-surface-container-low/50 overflow-hidden flex flex-col items-center justify-center min-h-[250px]">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <span className="material-symbols-outlined text-[120px] text-primary animate-[spin_60s_linear_infinite]">public</span>
            </div>
            <div className="relative z-10 text-center">
              <div className="font-headline-lg text-primary text-4xl font-bold">
                {carbon.currentEmissions} <span className="text-body-lg text-on-surface-variant text-lg">{carbon.unit}</span>
              </div>
              <p className="font-label-sm text-on-surface-variant mt-xs">
                {carbon.weeklyChange < 0 ? "" : "+"}{carbon.weeklyChange}% from last week
              </p>
            </div>
          </div>
        </section>

        {/* Terraform Drift */}
        <section className="md:col-span-12 glass-card p-lg stagger-fade-in">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary-container">warning</span>
              Terraform Drift Detection
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary-container/15 text-tertiary-container rounded-full font-label-sm">
              {driftItems.length} Changes Detected
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driftItems.map((drift, i) => (
              <div key={i} className="border border-white/5 rounded-lg bg-surface-container-low overflow-hidden">
                <div className="bg-surface-variant px-3 py-2 border-b border-white/5 font-label-sm text-on-surface-variant flex justify-between">
                  <span className="font-mono">{drift.resource}</span>
                  <span className="text-tertiary-container">{drift.status}</span>
                </div>
                <div className="p-3 font-mono text-sm overflow-x-auto whitespace-pre">
                  {drift.context.map((line, j) => (
                    <span
                      key={j}
                      className={`block ${
                        line.type === "removed"
                          ? "text-error bg-error/10 px-1 -mx-1"
                          : line.type === "added"
                          ? "text-primary bg-primary/10 px-1 -mx-1"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {line.value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
