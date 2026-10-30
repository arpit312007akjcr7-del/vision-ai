import React, { useEffect, useState } from "react";
import {
  Scan,
  ShieldCheck,
  Cpu,
  ShoppingBag,
  Activity,
  Eye,
  ArrowRight,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { MetricCard } from "../components/MetricCard.tsx";
import { DOMAIN_PROFILES, SAMPLE_IMAGES } from "../data/sampleImages.ts";
import { AnalyticsSummary, Inspection, InspectionDomain } from "../types/vision.ts";
import { ReportModal } from "../components/ReportModal.tsx";

interface DashboardPageProps {
  onNavigateToAnalyze: (domain?: InspectionDomain, sampleId?: string) => void;
  onNavigateToHistory: () => void;
  onNavigateToAnalytics: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToAnalyze,
  onNavigateToHistory,
  onNavigateToAnalytics,
}) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [sumRes, inspRes] = await Promise.all([
          fetch("/api/analytics/summary"),
          fetch("/api/inspections?limit=5"),
        ]);
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData);
        }
        if (inspRes.ok) {
          const inspData = await inspRes.json();
          setRecentInspections(inspData.items || []);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalScans = summary?.totalInspections ?? 28;
  const avgConf = summary?.averageConfidence ?? 95.8;

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner with Quick Trigger */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-mono text-indigo-300 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Autonomous Optical Inspection & Spatial Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Industrial Vision & Multi-Modal{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              Visual Intelligence
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Detect micro-defects, audit retail shelf planograms, screen auxiliary biomedical scans,
            and extract normalized bounding coordinates with sub-millimeter precision using Google Gemini.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToAnalyze()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-cyan-500 transition-all active:scale-95"
            >
              <Scan className="h-4 w-4" />
              <span>Launch Inspection Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={onNavigateToHistory}
              className="flex items-center gap-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 border border-slate-700/80 transition-colors"
            >
              <span>View Audit Logs</span>
            </button>
          </div>
        </div>

        {/* High-tech visual accent background */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-12 bottom-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Visual Scans"
          value={totalScans}
          subtext="Processed via Gemini Multimodal"
          icon={Scan}
          trend={{ value: "+24.5%", isPositive: true, label: "Weekly" }}
          accentColor="indigo"
        />
        <MetricCard
          title="Avg Model Confidence"
          value={`${avgConf}%`}
          subtext="Weighted bounding detection"
          icon={TrendingUp}
          trend={{ value: "High Precision", isPositive: true }}
          accentColor="cyan"
        />
        <MetricCard
          title="Compliance Verdict Rate"
          value="92.4%"
          subtext="Passed zero-tolerance QA criteria"
          icon={CheckCircle2}
          trend={{ value: "+3.2%", isPositive: true }}
          accentColor="emerald"
        />
        <MetricCard
          title="Defect Alert Frequency"
          value="7.6%"
          subtext="Solder bridges, voids & misplacements"
          icon={AlertOctagon}
          trend={{ value: "-1.8%", isPositive: true, label: "Reduced" }}
          accentColor="amber"
        />
      </div>

      {/* Target Domain Profiles / Quick Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pre-Configured Domain Pipelines
            </h2>
            <p className="text-xs text-slate-400">
              Select an engineered inspection profile calibrated for specific industrial tolerances
            </p>
          </div>
          <button
            onClick={() => onNavigateToAnalyze()}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>All Workspaces</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {DOMAIN_PROFILES.map((profile) => {
            const icons = {
              Cpu: Cpu,
              ShoppingBag: ShoppingBag,
              Activity: Activity,
              Eye: Eye,
            };
            const Icon = icons[profile.iconName as keyof typeof icons] || Layers;

            return (
              <div
                key={profile.id}
                onClick={() => onNavigateToAnalyze(profile.id)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 group-hover:text-cyan-400 transition-colors">
                    Pipeline Active
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {profile.title}
                </h3>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  {profile.shortDesc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-mono text-slate-400">Target Focus:</div>
                  <ul className="mt-1.5 space-y-1">
                    {profile.targetFocus.slice(0, 2).map((item, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 truncate">
                        <span className="h-1 w-1 rounded-full bg-cyan-400 shrink-0" />
                        <span className="truncate">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-cyan-400 pt-1">
                  <span>Launch Inspection</span>
                  <ArrowRight className="h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Inspection Feed & Benchmark Quick Triage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans (2 cols) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Recent Inspection Stream</h3>
            </div>
            <button
              onClick={onNavigateToHistory}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              View Full History →
            </button>
          </div>

          <div className="space-y-3">
            {recentInspections.slice(0, 4).map((insp) => (
              <div
                key={insp.id}
                onClick={() => setSelectedInspection(insp)}
                className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3 hover:border-slate-700 hover:bg-slate-900 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                    <img
                      src={insp.image_url}
                      alt="Scan"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        #{insp.id.toString().padStart(4, "0")}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                        {insp.domain}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1 max-w-sm sm:max-w-md">
                      {insp.summary}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {Number(insp.confidence_score).toFixed(1)}%
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(insp.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1-Click Benchmark Evaluation Box (1 col) */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Sparkles className="h-4 w-4" />
              <h3 className="text-sm font-bold text-white">Benchmark Assets</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Pre-curated visual samples to test bounding boxes and anomaly classification immediately.
            </p>

            <div className="space-y-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => onNavigateToAnalyze(sample.domain, sample.id)}
                  className="w-full flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-950/70 p-2.5 text-left hover:border-cyan-500/50 hover:bg-slate-900 transition-all text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="h-8 w-8 rounded object-cover shrink-0"
                    />
                    <div className="truncate">
                      <div className="font-medium text-slate-200 truncate">{sample.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{sample.domain}</div>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Precision Scale: 0-1000</span>
            <button
              onClick={onNavigateToAnalytics}
              className="text-cyan-400 hover:underline"
            >
              View Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {selectedInspection && (
        <ReportModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};
