import React, { useState } from "react";
import {
  X,
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Inspection, DetectedObject } from "../types/vision.ts";
import { AnalysisCanvas } from "./AnalysisCanvas.tsx";

interface ReportModalProps {
  inspection: Inspection | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ inspection, onClose }) => {
  const [activeTab, setActiveTab] = useState<"overview" | "rawJson">("overview");
  const [copied, setCopied] = useState(false);

  if (!inspection) return null;

  const rawAi = inspection.raw_ai_response || {};
  const verdict = rawAi.inspectionVerdict || (inspection.confidence_score > 90 ? "PASS" : "WARN");
  const detectedObjects: DetectedObject[] =
    rawAi.detectedObjects ||
    inspection.detected_objects?.map((o) => ({
      label: o.label,
      confidence: Number(o.confidence),
      box_2d: [o.box_2d_ymin, o.box_2d_xmin, o.box_2d_ymax, o.box_2d_xmax] as [number, number, number, number],
      details: o.details,
    })) ||
    [];

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(inspection, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(inspection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visionai_report_${inspection.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const verdictBadge = {
    PASS: {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      label: "PASS • Compliant",
    },
    WARN: {
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: AlertTriangle,
      label: "WARN • Non-Critical Anomaly",
    },
    FAIL: {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: XCircle,
      label: "FAIL • Critical Defect",
    },
    FLAGGED: {
      bg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      icon: AlertTriangle,
      label: "FLAGGED • Manual Review",
    },
    INCONCLUSIVE: {
      bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
      icon: AlertTriangle,
      label: "INCONCLUSIVE",
    },
  }[verdict as "PASS" | "WARN" | "FAIL"] || {
    bg: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    icon: CheckCircle2,
    label: verdict,
  };

  const VerdictIcon = verdictBadge.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-slate-950/90 px-6 py-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-cyan-400">
                AUDIT #{inspection.id.toString().padStart(5, "0")}
              </span>
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${verdictBadge.bg}`}
              >
                <VerdictIcon className="h-3.5 w-3.5" />
                <span>{verdictBadge.label}</span>
              </div>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
                {inspection.domain}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 font-mono">
              Timestamp: {new Date(inspection.created_at).toLocaleString()} • Model: Gemini 3.8 Flash Multimodal
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Download JSON Report"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
              title="Print / Save PDF Report"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-4 border-b border-slate-800 bg-slate-900/50 px-6 pt-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Visual Inspection & Detections
          </button>
          <button
            onClick={() => setActiveTab("rawJson")}
            className={`pb-2.5 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === "rawJson"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            Raw AI & Database JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" ? (
            <>
              {/* Executive Summary Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Executive Analysis Summary
                  </span>
                  <span className="font-mono text-sm font-bold text-cyan-400">
                    Confidence: {Number(inspection.confidence_score).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {inspection.summary}
                </p>

                {rawAi.domainInsights && rawAi.domainInsights.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-xs font-semibold text-slate-400 uppercase font-mono block mb-2">
                      Engineering & Compliance Insights:
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {rawAi.domainInsights.map((insight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-mono shrink-0">▸</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Canvas Visual Inspection */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                  Annotated Visual Media (HTML5 Canvas Overlays)
                </span>
                <AnalysisCanvas
                  imageUrl={inspection.image_url}
                  detectedObjects={detectedObjects}
                />
              </div>

              {/* Detected Objects Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Detected Bounding Boxes & Classification Metadata ({detectedObjects.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {detectedObjects.map((obj, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm text-white">{obj.label}</span>
                        <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-cyan-400 border border-slate-700">
                          {Number(obj.confidence).toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-300">
                        {obj.details || "No secondary notes provided."}
                      </div>
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <span>Coordinates: [{obj.box_2d.join(", ")}]</span>
                        <span className="text-slate-500">Scale: 0-1000</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Full inspection schema record serialized from PostgreSQL database
                </span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="max-h-[500px] overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-cyan-300">
                {JSON.stringify(inspection, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
