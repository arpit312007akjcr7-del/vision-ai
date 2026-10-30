import React from "react";
import {
  Scan,
  LayoutDashboard,
  Layers,
  History,
  BarChart3,
  Sparkles,
  Database,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";

export type NavTab = "dashboard" | "analyze" | "history" | "analytics";

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onNewScan: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNewScan,
}) => {
  const navItems = [
    { id: "dashboard" as NavTab, label: "Dashboard", icon: LayoutDashboard },
    { id: "analyze" as NavTab, label: "Analysis Workspace", icon: Layers },
    { id: "history" as NavTab, label: "Inspection History", icon: History },
    { id: "analytics" as NavTab, label: "Analytics & Trends", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab("dashboard")}
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 transition-colors group-hover:bg-slate-900">
                <Scan className="h-5 w-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-lg">
                  Vision<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">AI</span> Core
                </span>
                <span className="rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                  v2.5 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Computer Vision & Visual Intelligence
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-slate-800/80 text-white shadow-sm border border-slate-700/60"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section / Controls */}
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-3 text-xs bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-1.5 font-mono">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Gemini 3.8 Flash</span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              <span>Postgres RLS</span>
            </div>
          </div>

          {/* New Scan Action Button */}
          <button
            onClick={onNewScan}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Inspection</span>
          </button>

          {/* User profile avatar */}
          <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-semibold text-cyan-400 border border-slate-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-200">QA Lead</div>
              <div className="text-[10px] text-slate-400 font-mono">Secured RLS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden border-t border-slate-800/60 bg-slate-950 px-2 py-1 justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 text-[11px] font-medium ${
                isActive ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              <Icon className="h-4 w-4 mb-0.5" />
              {item.label.split(" ")[0]}
            </button>
          );
        })}
      </div>
    </header>
  );
};
