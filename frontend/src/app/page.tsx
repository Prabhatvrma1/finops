"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Link from "next/link";

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const tiltContainerRef = useRef<HTMLDivElement>(null);
  const tiltCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Simple SplitText Animation Implementation without paid plugins
      const heading = headingRef.current;
      if (heading) {
        // Keep the HTML structure, just wrap text nodes in spans
        const wrapTextNodes = (element: HTMLElement) => {
          const childNodes = Array.from(element.childNodes);
          element.innerHTML = ""; // Clear

          childNodes.forEach((node) => {
            if (node.nodeType === 3) {
              // Text node
              const text = node.nodeValue || "";
              const words = text.split(/(\s+)/); // Split by whitespace keeping the whitespace

              words.forEach((word) => {
                if (word.trim() === "") {
                  element.appendChild(document.createTextNode(word));
                } else {
                  const wordSpan = document.createElement("span");
                  wordSpan.className = "word inline-block whitespace-nowrap";

                  // Split into chars
                  const chars = word.split("");
                  chars.forEach((char) => {
                    const charSpan = document.createElement("span");
                    charSpan.className = "char inline-block opacity-0 translate-y-5";
                    charSpan.textContent = char;
                    wordSpan.appendChild(charSpan);
                  });
                  element.appendChild(wordSpan);
                }
              });
            } else if (node.nodeType === 1) {
              // Element node
              const el = node as HTMLElement;
              if (el.tagName.toLowerCase() === "br") {
                element.appendChild(el.cloneNode());
              } else {
                const newEl = el.cloneNode(false) as HTMLElement;
                element.appendChild(newEl);
                wrapTextNodes(el);
                newEl.innerHTML = el.innerHTML;
              }
            }
          });
        };

        const clone = heading.cloneNode(true) as HTMLElement;
        wrapTextNodes(clone);
        heading.innerHTML = clone.innerHTML;

        // Animate chars
        const chars = heading.querySelectorAll(".char");
        gsap.to(chars, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.02,
          ease: "power3.out",
          delay: 0.2,
        });
      }

      // Fade in other elements
      gsap.from(".fade-in-up", {
        opacity: 0,
        y: 20,
        duration: 1,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.8,
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

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

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
    <div ref={containerRef} className="relative w-full flex flex-col min-h-screen">
      {/* Ambient Background Glows */}
      <div className="bg-glow w-[50vw] h-[50vw] bg-primary/10 top-0 left-0 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="bg-glow w-[40vw] h-[40vw] bg-secondary-container/20 bottom-0 right-0 translate-x-1/3 translate-y-1/3"></div>

      {/* TopNavBar */}
      <nav className="bg-surface/40 backdrop-blur-md sticky top-0 z-50 w-full border-b border-white/10 shadow-sm">
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-[1400px] mx-auto">
          {/* Brand */}
          <Link href="/" className="font-headline-lg font-bold text-primary flex items-center gap-2 cursor-pointer active:scale-95 duration-200">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            CloudCostIQ
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-on-surface-variant font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3 py-2 rounded-lg cursor-pointer active:scale-95 duration-200">Product</Link>
            <Link href="#" className="text-on-surface-variant font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3 py-2 rounded-lg cursor-pointer active:scale-95 duration-200">Solutions</Link>
            <Link href="#" className="text-on-surface-variant font-medium hover:text-primary hover:bg-primary/10 transition-colors px-3 py-2 rounded-lg cursor-pointer active:scale-95 duration-200">Pricing</Link>
          </div>
          
          {/* Trailing Actions */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden md:flex btn-secondary px-6 py-2 rounded-lg font-title-md text-sm font-medium">Log In</Link>
            <Link href="/dashboard" className="btn-primary px-6 py-2 rounded-lg font-title-md text-sm font-bold">Dashboard Preview</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-xl flex flex-col gap-[120px] flex-grow">
        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center min-h-[calc(100vh-200px)] pt-xl">
          {/* Left: Typography & CTAs */}
          <div className="lg:col-span-6 flex flex-col gap-lg z-10">
            <h1 ref={headingRef} className="font-headline-xl text-5xl md:text-7xl leading-[1.05] font-extrabold text-on-surface">
              Understand.<br/>
              Optimize.<br/>
              <span className="text-primary">Reduce.</span><br/>
              Cloud Costs.
            </h1>
            <p className="fade-in-up font-body-lg text-lg text-on-surface-variant max-w-lg mt-4">
              Enterprise-grade FinOps intelligence. Gain crystal-clear visibility into your multicloud spend, automate optimizations, and align engineering with finance.
            </p>
            
            <div className="fade-in-up flex flex-wrap gap-4 mt-8">
              <Link href="/dashboard" className="btn-primary px-8 py-4 rounded-lg font-title-md text-base flex items-center gap-2">
                Get Started
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <button className="btn-secondary px-8 py-4 rounded-lg font-title-md text-base flex items-center gap-2">
                View Demo
                <span className="material-symbols-outlined text-sm">play_circle</span>
              </button>
            </div>
            
            {/* Social Proof */}
            <div className="fade-in-up mt-xl pt-lg border-t border-white/5">
              <p className="font-label-sm text-on-surface-variant mb-4 uppercase tracking-wider">Trusted by innovative teams</p>
              <div className="flex gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                <span className="material-symbols-outlined text-3xl">api</span>
                <span className="material-symbols-outlined text-3xl">dns</span>
                <span className="material-symbols-outlined text-3xl">database</span>
                <span className="material-symbols-outlined text-3xl">memory</span>
              </div>
            </div>
          </div>
          
          {/* Right: 3D Glass Dashboard Preview */}
          <div ref={tiltContainerRef} className="fade-in-up lg:col-span-6 tilt-container h-full relative flex justify-center items-center mt-xl lg:mt-0">
            {/* Decorative background ring */}
            <div className="absolute w-[400px] h-[400px] border border-primary/20 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute w-[300px] h-[300px] border border-secondary/10 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-dashed"></div>
            
            {/* The 3D Card */}
            <div ref={tiltCardRef} className="tilt-card glass-card rounded-xl p-lg w-full max-w-md relative z-10 shadow-2xl">
              {/* Top Bar of Mockup */}
              <div className="flex justify-between items-center mb-lg border-b border-white/5 pb-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">dashboard</span>
                  <span className="font-title-md text-on-surface">Cost Overview</span>
                </div>
                <span className="px-2 py-1 rounded bg-primary/10 text-primary font-label-sm">Live</span>
              </div>
              
              {/* Main Stat */}
              <div className="mb-lg">
                <p className="font-label-sm text-on-surface-variant mb-1">Total Month-to-Date Spend</p>
                <div className="flex items-end gap-3">
                  <span className="font-headline-lg text-4xl text-on-surface font-bold">$124,592</span>
                  <span className="text-error font-body-md flex items-center mb-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span> 4.2%
                  </span>
                </div>
              </div>
              
              {/* Mini Chart Area */}
              <div className="h-32 flex items-end gap-2 mb-lg w-full border-b border-l border-white/10 p-2">
                <div className="w-1/6 bg-secondary-container/50 rounded-t h-1/2 hover:bg-primary/40 transition-colors cursor-pointer"></div>
                <div className="w-1/6 bg-secondary-container/50 rounded-t h-2/3 hover:bg-primary/40 transition-colors cursor-pointer"></div>
                <div className="w-1/6 bg-secondary-container/50 rounded-t h-1/3 hover:bg-primary/40 transition-colors cursor-pointer"></div>
                <div className="w-1/6 bg-secondary-container/50 rounded-t h-4/5 hover:bg-primary/40 transition-colors cursor-pointer"></div>
                <div className="w-1/6 bg-primary/50 rounded-t h-full hover:bg-primary/80 transition-colors cursor-pointer relative group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-high px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10">$28k</div>
                </div>
                <div className="w-1/6 bg-secondary-container/50 rounded-t h-[90%] hover:bg-primary/40 transition-colors cursor-pointer"></div>
              </div>
              
              {/* Action List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container/50 hover:bg-surface-container transition-colors border border-white/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">memory</span>
                    <span className="font-body-md text-sm">Unattached EBS Volumes</span>
                  </div>
                  <span className="text-primary font-bold text-sm">-$1,240</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container/50 hover:bg-surface-container transition-colors border border-white/5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary">database</span>
                    <span className="font-body-md text-sm">Idle RDS Instances</span>
                  </div>
                  <span className="text-primary font-bold text-sm">-$890</span>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -right-8 top-1/4 glass-card p-3 rounded-lg flex items-center gap-2 z-20 shadow-lg animate-[bounce_4s_infinite]">
              <span className="material-symbols-outlined text-primary">auto_awesome</span>
              <span className="font-label-sm text-on-surface">AI Suggested</span>
            </div>
            <div className="absolute -left-4 bottom-1/4 glass-card p-3 rounded-lg flex items-center gap-2 z-20 shadow-lg animate-[bounce_5s_infinite_reverse]">
              <span className="material-symbols-outlined text-secondary">security</span>
              <span className="font-label-sm text-on-surface">Compliance OK</span>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-xl fade-in-up">
          <div className="text-center mb-xl">
            <h2 className="font-headline-lg text-3xl text-on-surface mb-4 font-bold">Deep Intelligence for Modern Cloud Architectures</h2>
            <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">Stop guessing. Start optimizing. CloudCostIQ provides granular insights and automated actions to keep your cloud economics healthy.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-gutter max-w-6xl mx-auto">
            {/* Large Feature Card */}
            <div className="md:col-span-2 md:row-span-2 glass-card rounded-xl p-lg flex flex-col group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-2xl">insights</span>
              </div>
              <h3 className="font-title-md text-on-surface mb-2 font-semibold">Predictive Forecasting</h3>
              <p className="font-body-md text-on-surface-variant mb-8 flex-grow">
                Utilize advanced machine learning models to predict future spend based on historical trends, seasonality, and application growth. Never be surprised by a bill again.
              </p>
              
              <div className="h-32 w-full mt-auto relative border-t border-white/5 pt-4">
                <div className="absolute inset-0 top-4 overflow-hidden flex items-end opacity-70">
                  <svg className="w-full h-full stroke-primary fill-none stroke-[0.5]" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path d="M0,20 Q10,10 20,20 T40,20 T60,20 T80,10 T100,20"></path>
                  </svg>
                  <svg className="w-full h-full stroke-secondary absolute top-0 left-0 fill-none stroke-[0.5] opacity-50" preserveAspectRatio="none" viewBox="0 0 100 30">
                    <path d="M0,25 Q15,15 30,25 T60,25 T90,15 T100,25"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Smaller Feature Card 1 */}
            <div className="md:col-span-1 md:row-span-1 glass-card rounded-xl p-lg group hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-secondary text-xl">auto_fix_high</span>
              </div>
              <h3 className="font-title-md text-base text-on-surface mb-2 font-semibold">Automated Rightsizing</h3>
              <p className="font-body-md text-sm text-on-surface-variant">Continuously analyze CPU and memory metrics to recommend exact instance types.</p>
            </div>
            
            {/* Smaller Feature Card 2 */}
            <div className="md:col-span-1 md:row-span-1 glass-card rounded-xl p-lg group hover:border-primary/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-tertiary text-xl">policy</span>
              </div>
              <h3 className="font-title-md text-base text-on-surface mb-2 font-semibold">Guardrails & Budgets</h3>
              <p className="font-body-md text-sm text-on-surface-variant">Set strict spending limits per team or environment with automated alert triggers.</p>
            </div>
            
            {/* Medium Feature Card */}
            <div className="md:col-span-2 md:row-span-1 glass-card rounded-xl p-lg flex items-center gap-6 group hover:border-primary/30 transition-colors">
              <div className="flex-grow">
                <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-xl">hub</span>
                </div>
                <h3 className="font-title-md text-base text-on-surface mb-2 font-semibold">Multi-Cloud Unified View</h3>
                <p className="font-body-md text-sm text-on-surface-variant">AWS, Azure, and GCP normalized into a single, cohesive reporting structure.</p>
              </div>
              <div className="w-24 h-24 rounded-full border-[4px] border-surface-container-high relative flex-shrink-0 flex items-center justify-center">
                <div className="absolute inset-0 border-[4px] border-primary rounded-full border-t-transparent -rotate-45"></div>
                <span className="font-label-sm text-on-surface">100%</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full border-t border-outline-variant/50 flex justify-between items-center px-margin-mobile md:px-margin-desktop py-lg mt-auto flex-col md:flex-row gap-4 md:gap-0">
        <div className="font-label-sm font-bold text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
          CloudCostIQ
        </div>
        <div className="flex gap-6">
          <Link href="#" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">API Docs</Link>
          <Link href="#" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Pricing</Link>
          <Link href="#" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Security</Link>
          <Link href="#" className="font-label-sm text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline">Terms</Link>
        </div>
        <div className="font-label-sm text-on-surface-variant">
          © 2026 CloudCostIQ Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
