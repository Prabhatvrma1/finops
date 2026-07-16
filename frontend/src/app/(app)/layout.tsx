"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="bg-background text-on-surface font-body-md antialiased ambient-bg min-h-screen flex overflow-hidden">
      {/* SideNavBar (Hidden on Mobile, Flex on Desktop) */}
      <nav className="hidden md:flex flex-col h-screen py-lg bg-surface-container/40 backdrop-blur-xl border-r border-white/10 shadow-xl docked left-0 w-64 sticky z-40 shrink-0">
        <div className="px-lg mb-xl flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary font-title-md" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
          <div>
            <h1 className="font-title-md font-bold text-primary">CloudCostIQ</h1>
            <p className="font-label-sm text-on-surface-variant">Enterprise FinOps</p>
          </div>
        </div>
        <div className="flex-1 px-sm space-y-sm overflow-y-auto">
          {/* Active Tab: Dashboard */}
          <Link href="/dashboard" className={`${pathname === '/dashboard' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-secondary-container/20'} rounded-lg px-4 py-3 flex items-center gap-3 transition-all cursor-pointer duration-300`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-body-md font-medium">Dashboard</span>
          </Link>
          <Link href="/infrastructure" className={`${pathname === '/infrastructure' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-secondary-container/20'} rounded-lg px-4 py-3 flex items-center gap-3 transition-all cursor-pointer duration-300`}>
            <span className="material-symbols-outlined">insights</span>
            <span className="font-body-md">Infrastructure</span>
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-on-surface hover:bg-secondary-container/20 px-4 py-3 flex items-center gap-3 transition-all rounded-lg cursor-pointer duration-300">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-body-md">Optimization</span>
          </Link>
          <Link href="#" className="text-on-surface-variant hover:text-on-surface hover:bg-secondary-container/20 px-4 py-3 flex items-center gap-3 transition-all rounded-lg cursor-pointer duration-300">
            <span className="material-symbols-outlined">cloud</span>
            <span className="font-body-md">Cloud Providers</span>
          </Link>
        </div>
        <div className="px-lg mt-auto pt-lg border-t border-white/5 space-y-sm">
          <button className="w-full bg-primary-container text-on-primary-container font-label-sm py-2 rounded-lg hover:brightness-110 transition-all shadow-[0_0_12px_rgba(15,164,175,0.3)]">
            Upgrade Plan
          </button>
          <div className="mt-sm space-y-xs">
            <Link href="#" className="text-on-surface-variant hover:text-on-surface hover:bg-secondary-container/20 px-4 py-2 flex items-center gap-3 transition-all rounded-lg cursor-pointer duration-300">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>help</span>
              <span className="font-label-sm">Support</span>
            </Link>
            <Link href="#" className="text-on-surface-variant hover:text-on-surface hover:bg-secondary-container/20 px-4 py-2 flex items-center gap-3 transition-all rounded-lg cursor-pointer duration-300">
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>logout</span>
              <span className="font-label-sm">Sign Out</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* TopNavBar */}
        <header className="bg-surface/40 backdrop-blur-md font-headline-lg border-b border-white/10 shadow-sm docked full-width top-0 sticky z-50 flex justify-between items-center w-full px-lg py-sm max-w-full shrink-0">
          <div className="md:hidden flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary font-headline-lg-mobile" style={{ fontVariationSettings: "'FILL' 1" }}>cloud</span>
            <span className="font-headline-lg-mobile font-bold text-primary">CloudCostIQ</span>
          </div>
          <div className="hidden md:block">
            <h2 className="font-headline-lg font-bold text-on-surface tracking-tight capitalize">{pathname.replace('/', '')}</h2>
          </div>
          <div className="flex items-center gap-md">
            <div className="hidden md:flex items-center bg-surface-container-high rounded-full px-4 py-2 border-b-2 border-transparent focus-within:border-primary transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input className="bg-transparent border-none focus:ring-0 text-body-md text-on-surface placeholder-on-surface-variant w-48 outline-none" placeholder="Search resources..." type="text" />
            </div>
            <button className="p-2 text-on-surface-variant hover:bg-primary/10 transition-colors rounded-full cursor-pointer active:scale-95 duration-200">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-primary/10 transition-colors rounded-full cursor-pointer active:scale-95 duration-200">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/50 ml-sm cursor-pointer hover:border-primary transition-colors">
              <img className="w-full h-full object-cover" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHwtLH65gGkfpufI69AFrCv3tJeWeuZXrV0Uf0MycBPWRchOGDQKzrAoNLqNMU06U9HtXkxEKpbzLBY8eS94i0aKoAn9V2a_wWtHdCOC2Ip1OfH_K_wLTt4N6MHb_MQwAsSn0LbnyF3miVITmx_kv3MdqCKr3YCRaEx3XGQmKXl2msJgnyfO__nSUVen4cHc6ngsK9pT-JwBiMcA4357PDXgsCcfyCk8PEqXjMz5t3o-lLjsL8qFclZw" />
            </div>
          </div>
        </header>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-xl pb-xl">
            {children}
            
            {/* Footer */}
            <footer className="flex justify-between items-center px-margin-desktop py-lg w-full mt-xl bg-surface-container-lowest border-t border-outline-variant/50 relative bottom-0 rounded-xl">
              <span className="font-label-sm font-bold text-primary">© 2026 CloudCostIQ Inc. All rights reserved.</span>
              <div className="flex gap-md font-label-sm text-on-surface-variant">
                <Link className="hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">API Docs</Link>
                <Link className="hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">Pricing</Link>
                <Link className="hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">Security</Link>
                <Link className="hover:text-primary transition-colors underline-offset-4 hover:underline" href="#">Terms</Link>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
