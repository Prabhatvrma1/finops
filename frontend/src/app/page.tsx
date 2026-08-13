"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tiltContainerRef = useRef<HTMLDivElement>(null);
  const tiltCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        ease: "power3.out",
      });
      gsap.from(".hero-sub", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power2.out",
      });
      gsap.from(".hero-cta", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power2.out",
      });
      gsap.from(".hero-card", {
        opacity: 0,
        scale: 0.95,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
      gsap.from(".feature-card", {
        opacity: 0,
        y: 25,
        duration: 0.7,
        stagger: 0.15,
        delay: 0.6,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // 3D Tilt Effect
  useEffect(() => {
    const tiltContainer = tiltContainerRef.current;
    const tiltCard = tiltCardRef.current;

    if (!tiltContainer || !tiltCard) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = tiltContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      tiltCard.style.transform = `rotateX(0deg) rotateY(0deg)`;
      tiltCard.style.transition = "transform 0.5s ease-out";
    };

    const handleMouseEnter = () => {
      tiltCard.style.transition = "transform 0.1s ease-out";
    };

    tiltContainer.addEventListener("mousemove", handleMouseMove);
    tiltContainer.addEventListener("mouseleave", handleMouseLeave);
    tiltContainer.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      tiltContainer.removeEventListener("mousemove", handleMouseMove);
      tiltContainer.removeEventListener("mouseleave", handleMouseLeave);
      tiltContainer.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col min-h-screen bg-surface text-on-surface overflow-x-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Top Navigation Bar */}
      <nav className="bg-surface/60 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-white/10 shadow-sm">
        <div className="flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-7xl mx-auto">
          {/* Brand */}
          <Link href="/" className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined text-2xl md:text-3xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            <span className="tracking-tight">CloudCostIQ</span>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-on-surface-variant hover:text-primary transition-colors">Product</a>
            <a href="#solutions" className="text-on-surface-variant hover:text-primary transition-colors">Solutions</a>
            <a href="#pricing" className="text-on-surface-variant hover:text-primary transition-colors">Pricing</a>
            <a href="http://localhost:4000/api-docs" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-primary transition-colors">API Docs</a>
          </div>
          
          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="hidden sm:inline-flex px-5 py-2 rounded-xl text-sm font-medium border border-white/10 text-on-surface hover:bg-white/5 transition-all">
              Log In
            </Link>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary-container text-on-primary-container hover:brightness-110 shadow-lg shadow-primary/20 transition-all cursor-pointer">
              Dashboard Preview
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 flex flex-col gap-24 flex-grow">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-160px)]">
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 flex flex-col gap-6 z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold w-fit">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              <span>Next-Gen Enterprise FinOps Intelligence</span>
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
              Understand. <br />
              Optimize. <br />
              <span className="text-primary bg-gradient-to-r from-primary to-primary-fixed-dim bg-clip-text text-transparent">Reduce.</span> <br />
              Cloud Costs.
            </h1>

            <p className="hero-sub text-base sm:text-lg text-on-surface-variant leading-relaxed max-w-xl">
              Gain crystal-clear visibility into your multicloud spend across AWS, GCP, and Azure. Automate rightsizing, track carbon impact, and eliminate cloud waste effortlessly.
            </p>
            
            <div className="hero-cta flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard" className="px-7 py-3.5 rounded-xl font-semibold text-base bg-primary text-on-primary hover:brightness-110 shadow-xl shadow-primary/25 transition-all flex items-center gap-2.5 cursor-pointer">
                <span>Explore Dashboard</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
              <Link href="/infrastructure" className="px-7 py-3.5 rounded-xl font-semibold text-base border border-white/10 text-on-surface hover:bg-white/5 transition-all flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-lg text-primary">insights</span>
                <span>Infrastructure View</span>
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="pt-8 border-t border-white/10 mt-4">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Supported Cloud Providers & Tooling</p>
              <div className="flex flex-wrap items-center gap-6 text-on-surface-variant/60 font-semibold text-sm">
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-amber-400">cloud</span> AWS</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-blue-400">cloud_queue</span> GCP</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sky-400">cloud_done</span> Azure</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-emerald-400">token</span> Kubernetes</span>
                <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-purple-400">layers</span> Terraform</span>
              </div>
            </div>
          </div>
          
          {/* Right Column: 3D Preview Card */}
          <div ref={tiltContainerRef} className="hero-card lg:col-span-6 tilt-container relative flex justify-center items-center">
            {/* Background Accent Circles */}
            <div className="absolute w-80 h-80 sm:w-96 sm:h-96 border border-primary/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute w-64 h-64 sm:w-72 sm:h-72 border border-secondary/15 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed pointer-events-none"></div>
            
            {/* 3D Glass Card */}
            <div ref={tiltCardRef} className="tilt-card glass-card rounded-2xl p-6 w-full max-w-lg relative z-10 shadow-2xl border border-white/10 space-y-6">
              {/* Card Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl">dashboard</span>
                  <span className="font-semibold text-on-surface text-base">Cost Overview</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live
                </span>
              </div>
              
              {/* Spend Stat */}
              <div>
                <p className="text-xs text-on-surface-variant font-medium mb-1 uppercase tracking-wider">Total Month-to-Date Spend</p>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl sm:text-4xl font-extrabold text-on-surface">$124,592</span>
                  <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm">trending_down</span> -8.4% vs last mo
                  </span>
                </div>
              </div>
              
              {/* Bar Chart Visualization */}
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-2 font-medium">
                  <span>Weekly Trend</span>
                  <span>Target: $135k</span>
                </div>
                <div className="h-28 flex items-end gap-2.5 w-full bg-surface-variant/20 rounded-xl p-3 border border-white/5">
                  <div className="w-1/6 bg-primary/30 rounded-lg h-1/2 hover:bg-primary/50 transition-colors"></div>
                  <div className="w-1/6 bg-primary/30 rounded-lg h-2/3 hover:bg-primary/50 transition-colors"></div>
                  <div className="w-1/6 bg-primary/30 rounded-lg h-1/3 hover:bg-primary/50 transition-colors"></div>
                  <div className="w-1/6 bg-primary/40 rounded-lg h-4/5 hover:bg-primary/60 transition-colors"></div>
                  <div className="w-1/6 bg-primary rounded-lg h-full hover:brightness-110 transition-all shadow-md shadow-primary/30 relative group">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-high px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 font-mono text-primary">$28k</div>
                  </div>
                  <div className="w-1/6 bg-primary/30 rounded-lg h-[75%] hover:bg-primary/50 transition-colors"></div>
                </div>
              </div>
              
              {/* Savings Recommendations */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-400 text-lg">memory</span>
                    <span className="text-xs font-medium text-on-surface">Unattached EBS Volumes</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">-$1,240/mo</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container/60 hover:bg-surface-container transition-colors border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-sky-400 text-lg">database</span>
                    <span className="text-xs font-medium text-on-surface">Idle RDS Instances</span>
                  </div>
                  <span className="text-emerald-400 font-bold text-xs">-$890/mo</span>
                </div>
              </div>
            </div>
            
            {/* Floating Badges */}
            <div className="absolute -right-4 top-10 glass-card p-3 rounded-xl flex items-center gap-2 z-20 shadow-xl border border-white/10 animate-[bounce_4s_infinite]">
              <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
              <span className="text-xs font-semibold text-on-surface">AI Rightsizing Active</span>
            </div>
            <div className="absolute -left-4 bottom-10 glass-card p-3 rounded-xl flex items-center gap-2 z-20 shadow-xl border border-white/10 animate-[bounce_5s_infinite_reverse]">
              <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
              <span className="text-xs font-semibold text-on-surface">FinOps Guardrails OK</span>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="features" className="py-12">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">Deep Intelligence for Cloud Economics</h2>
            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto">
              Automate cost allocation, identify idle resources, and forecast monthly spend with enterprise-grade accuracy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card glass-card p-8 rounded-2xl border border-white/10 hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">insights</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">AI-Powered Anomaly Alerts</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Detect abnormal cloud spend spikes in real time across services and accounts before they impact your monthly budget.
              </p>
            </div>

            <div className="feature-card glass-card p-8 rounded-2xl border border-white/10 hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">token</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Kubernetes Cost Allocation</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Break down EKS, GKE, and AKS cluster costs down to namespaces, pods, and individual microservices with OpenCost integration.
              </p>
            </div>

            <div className="feature-card glass-card p-8 rounded-2xl border border-white/10 hover:border-primary/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Carbon Footprint Tracking</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Measure the environmental impact of your cloud infrastructure alongside monetary costs to meet sustainability goals.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-primary-container/20 to-surface-container p-10 md:p-14 rounded-3xl border border-primary/20 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-on-surface">Ready to Optimize Your Cloud Spend?</h2>
            <p className="text-base text-on-surface-variant">
              Connect your cloud providers in under 5 minutes with safe read-only access.
            </p>
            <div className="pt-2">
              <Link href="/dashboard" className="px-8 py-4 rounded-xl font-bold text-base bg-primary text-on-primary hover:brightness-110 shadow-xl shadow-primary/25 transition-all inline-flex items-center gap-2 cursor-pointer">
                <span>Launch CloudCostIQ Dashboard</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full border-t border-white/10 py-8 px-6 md:px-12 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            <span>CloudCostIQ</span>
          </div>
          <div className="flex gap-6 text-sm text-on-surface-variant">
            <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            <Link href="/infrastructure" className="hover:text-primary transition-colors">Infrastructure</Link>
            <Link href="/settings" className="hover:text-primary transition-colors">Settings</Link>
            <a href="http://localhost:4000/api-docs" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">API Docs</a>
          </div>
          <div className="text-xs text-on-surface-variant">
            © 2026 CloudCostIQ Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
