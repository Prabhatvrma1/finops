"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function InfrastructurePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Any animations for infrastructure page can go here
      gsap.from(".stagger-fade-in", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        stagger: 0.2,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-xl">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 stagger-fade-in">
        <div>
          <h2 className="font-headline-xl font-bold text-primary">Infrastructure &amp; Forecast</h2>
          <p className="font-body-lg text-on-surface-variant mt-sm">Real-time topology, drift detection, and emissions tracking.</p>
        </div>
        <div className="flex gap-sm">
          <button className="px-4 py-2 border border-primary/20 bg-primary/5 text-primary rounded-lg font-label-sm hover:bg-primary/10 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Report
          </button>
          <button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-sm glow-btn-primary hover:bg-primary transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">refresh</span> Sync State
          </button>
        </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter stagger-fade-in">
        {/* K8s Topology Map */}
        <section className="md:col-span-8 glass-card p-lg flex flex-col relative overflow-hidden min-h-[400px]">
          <div className="flex justify-between items-center mb-md z-10 relative">
            <h3 className="font-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">lan</span>
              Kubernetes Topology
            </h3>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/15 text-primary rounded-full font-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Live
              </span>
            </div>
          </div>
          <div className="flex-1 relative z-0 border border-white/5 rounded-lg bg-surface-container-low/50 overflow-hidden flex items-center justify-center">
            {/* Abstract topology viz placeholder */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
            <div className="text-center text-on-surface-variant relative z-10">
              <span className="material-symbols-outlined text-[48px] text-primary/30 mb-2">hub</span>
              <p className="font-label-sm">Interactive Cluster Graph Active</p>
              <p className="text-xs opacity-50">US-East-1 (EKS)</p>
            </div>
          </div>
        </section>

        {/* Carbon Tracker */}
        <section className="md:col-span-4 glass-card p-lg flex flex-col relative overflow-hidden">
          <h3 className="font-title-md text-on-surface flex items-center gap-2 mb-md relative z-10">
            <span className="material-symbols-outlined text-[#0FA4AF]">eco</span>
            Carbon Footprint
          </h3>
          <div className="flex-1 relative border border-white/5 rounded-lg bg-surface-container-low/50 overflow-hidden flex flex-col items-center justify-center min-h-[250px]">
            {/* Animated Globe Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <span className="material-symbols-outlined text-[120px] text-primary animate-[spin_60s_linear_infinite]">public</span>
            </div>
            <div className="relative z-10 text-center">
              <div className="font-headline-lg text-primary text-4xl font-bold">12.4 <span className="text-body-lg text-on-surface-variant text-lg">tCO2e</span></div>
              <p className="font-label-sm text-on-surface-variant mt-xs">-2.1% from last week</p>
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
              2 Changes Detected
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Diff Panel 1 */}
            <div className="border border-white/5 rounded-lg bg-surface-container-low overflow-hidden">
              <div className="bg-surface-variant px-3 py-2 border-b border-white/5 font-label-sm text-on-surface-variant flex justify-between">
                <span>aws_db_instance.main</span>
                <span className="text-tertiary-container">Modified</span>
              </div>
              <div className="p-3 font-mono text-sm overflow-x-auto whitespace-pre">
                <span className="text-on-surface-variant">  allocated_storage = 20{"\n"}</span>
                <span className="text-error bg-error/10 block px-1 -mx-1">- instance_class    = "db.t3.micro"{"\n"}</span>
                <span className="text-primary bg-primary/10 block px-1 -mx-1">+ instance_class    = "db.t3.medium"{"\n"}</span>
                <span className="text-on-surface-variant">  engine            = "postgres"</span>
              </div>
            </div>

            {/* Diff Panel 2 */}
            <div className="border border-white/5 rounded-lg bg-surface-container-low overflow-hidden">
              <div className="bg-surface-variant px-3 py-2 border-b border-white/5 font-label-sm text-on-surface-variant flex justify-between">
                <span>aws_s3_bucket.data_lake</span>
                <span className="text-tertiary-container">Modified</span>
              </div>
              <div className="p-3 font-mono text-sm overflow-x-auto whitespace-pre">
                <span className="text-on-surface-variant">  bucket = "prod-data-lake-01"{"\n"}</span>
                <span className="text-on-surface-variant">  versioning {"{"}{"\n"}</span>
                <span className="text-error bg-error/10 block px-1 -mx-1">-   enabled = false{"\n"}</span>
                <span className="text-primary bg-primary/10 block px-1 -mx-1">+   enabled = true{"\n"}</span>
                <span className="text-on-surface-variant">  {"}"}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
