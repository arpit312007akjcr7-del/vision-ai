import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: "indigo" | "cyan" | "emerald" | "amber" | "rose";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  accentColor = "indigo",
}) => {
  const colorMap = {
    indigo: {
      bg: "from-indigo-950/40 to-slate-900/60",
      border: "border-indigo-500/30",
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      glow: "hover:shadow-indigo-500/10",
    },
    cyan: {
      bg: "from-cyan-950/40 to-slate-900/60",
      border: "border-cyan-500/30",
      iconBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      glow: "hover:shadow-cyan-500/10",
    },
    emerald: {
      bg: "from-emerald-950/40 to-slate-900/60",
      border: "border-emerald-500/30",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      glow: "hover:shadow-emerald-500/10",
    },
    amber: {
      bg: "from-amber-950/40 to-slate-900/60",
      border: "border-amber-500/30",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      glow: "hover:shadow-amber-500/10",
    },
    rose: {
      bg: "from-rose-950/40 to-slate-900/60",
      border: "border-rose-500/30",
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      glow: "hover:shadow-rose-500/10",
    },
  };

  const scheme = colorMap[accentColor];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border ${scheme.border} bg-gradient-to-b ${scheme.bg} p-5 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${scheme.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
          {title}
        </span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${scheme.iconBg}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
              trend.isPositive
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {(subtext || trend?.label) && (
        <p className="mt-1 text-xs text-slate-400">
          {trend?.label ? `${trend.label} • ` : ""}
          {subtext}
        </p>
      )}

      {/* Decorative subtle high-tech grid corner accent */}
      <div className="pointer-events-none absolute right-0 top-0 h-12 w-12 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] [background-size:6px_6px]" />
    </div>
  );
};
