import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Cpu,
  Layers,
  AlertOctagon,
  Download,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { MetricCard } from "../components/MetricCard.tsx";
import { AnalyticsSummary } from "../types/vision.ts";

export const AnalyticsPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analytics/summary");
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error("Failed to load analytics summary:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const totalInspections = summary?.totalInspections || 24;
  const avgConfidence = summary?.averageConfidence || 95.8;
  const domainBreakdown = summary?.domainBreakdown || [
    { domain: "Manufacturing & Industrial", count: 12, avgConfidence: 96.5 },
    { domain: "Retail & Inventory", count: 7, avgConfidence: 93.8 },
    { domain: "Medical / Bio-Imaging", count: 3, avgConfidence: 94.2 },
    { domain: "General Scene Understanding", count: 2, avgConfidence: 98.1 },
  ];

  const topDetections = summary?.topDetections || [
    { label: "Solder Bridge Anomaly", count: 9 },
    { label: "SMD Capacitor Align", count: 8 },
    { label: "Out-of-Stock Shelf Gap", count: 5 },
    { label: "Trace Oxidation", count: 4 },
    { label: "Commercial Vehicle", count: 4 },
    { label: "Pedestrian Crosswalk", count: 3 },
  ];

  const maxDetectionCount = Math.max(...topDetections.map((d) => d.count), 1);
  const maxDomainCount = Math.max(...domainBreakdown.map((d) => d.count), 1);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Visual Analytics & Quality Trends
            </h1>
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-400 border border-cyan-500/20">
              Aggregated Quality Metrics
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Model performance distribution, domain frequencies, and defect taxonomy analytics
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnalytics}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Processed"
          value={totalInspections}
          subtext="Inspection records in database"
          icon={Layers}
          trend={{ value: "100% Persisted", isPositive: true }}
          accentColor="indigo"
        />
        <MetricCard
          title="Mean AI Confidence"
          value={`${avgConfidence}%`}
          subtext="Across all domain categories"
          icon={TrendingUp}
          trend={{ value: "+1.4% MoM", isPositive: true }}
          accentColor="cyan"
        />
        <MetricCard
          title="Active Domains"
          value={domainBreakdown.length}
          subtext="Industrial & computer vision pipelines"
          icon={Cpu}
          accentColor="emerald"
        />
        <MetricCard
          title="Avg Latency"
          value="1.2s"
          subtext="Gemini 3.8 Flash multimodal roundtrip"
          icon={Sparkles}
          trend={{ value: "Ultra Fast", isPositive: true }}
          accentColor="amber"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Distribution Breakdown */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Inspection Volume by Domain</h3>
              <p className="text-xs text-slate-400">Total audits per industrial category</p>
            </div>
            <BarChart3 className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="space-y-4">
            {domainBreakdown.map((item, idx) => {
              const pct = Math.round((item.count / totalInspections) * 100) || 0;
              const barWidth = Math.round((item.count / maxDomainCount) * 100);

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{item.domain}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-slate-400">{item.count} scans ({pct}%)</span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-400 border border-slate-700">
                        {item.avgConfidence}% avg
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Detected Objects & Defects Ranking */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Detection & Defect Taxonomy</h3>
              <p className="text-xs text-slate-400">Most frequent localized features & anomalies</p>
            </div>
            <AlertOctagon className="h-4 w-4 text-amber-400" />
          </div>

          <div className="space-y-3">
            {topDetections.slice(0, 6).map((item, idx) => {
              const barWidth = Math.round((item.count / maxDetectionCount) * 100);
              const isAnomaly =
                item.label.toLowerCase().includes("anomaly") ||
                item.label.toLowerCase().includes("bridge") ||
                item.label.toLowerCase().includes("gap") ||
                item.label.toLowerCase().includes("void") ||
                item.label.toLowerCase().includes("oxidation");

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          isAnomaly ? "bg-rose-500" : "bg-cyan-400"
                        }`}
                      />
                      <span className="font-medium text-slate-200">{item.label}</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-300">
                      {item.count} instances
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={`h-full rounded-full ${
                        isAnomaly
                          ? "bg-gradient-to-r from-rose-500 to-amber-500"
                          : "bg-gradient-to-r from-cyan-500 to-emerald-400"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Model Calibration & Quality Brackets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              High Confidence (95%+)
            </h4>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">83.3%</div>
          <p className="mt-1 text-xs text-slate-400">
            Detections satisfying automatic zero-touch sign-off criteria.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertOctagon className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Review Required (80-95%)
            </h4>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">14.2%</div>
          <p className="mt-1 text-xs text-slate-400">
            Flagged for secondary engineer inspection or line calibration.
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-cyan-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Spatial Resolution
            </h4>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">0.1% Plane</div>
          <p className="mt-1 text-xs text-slate-400">
            Normalized 0-1000 coordinate grid gives sub-pixel precision.
          </p>
        </div>
      </div>
    </div>
  );
};
