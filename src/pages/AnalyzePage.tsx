import React, { useState, useEffect } from "react";
import {
  Layers,
  Sparkles,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Share2,
  Cpu,
  ShoppingBag,
  Activity,
  Eye,
  Info,
  Maximize2,
} from "lucide-react";
import { ImageDropzone } from "../components/ImageDropzone.tsx";
import { AnalysisCanvas } from "../components/AnalysisCanvas.tsx";
import { ReportModal } from "../components/ReportModal.tsx";
import { DOMAIN_PROFILES, SAMPLE_IMAGES, SampleImage } from "../data/sampleImages.ts";
import {
  DetectedObject,
  Inspection,
  InspectionDomain,
  StrictnessLevel,
  AIAnalysisResult,
} from "../types/vision.ts";

interface AnalyzePageProps {
  initialDomain?: InspectionDomain;
  initialSampleId?: string;
  onInspectionCreated?: (newInspection: Inspection) => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({
  initialDomain,
  initialSampleId,
  onInspectionCreated,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<InspectionDomain>(
    initialDomain || "Manufacturing & Industrial"
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [strictnessLevel, setStrictnessLevel] = useState<StrictnessLevel>("medium");
  const [enableBoundingBoxes, setEnableBoundingBoxes] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>("");
  const [customPromptOverride, setCustomPromptOverride] = useState<string>("");
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  // Execution & Results State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [createdInspection, setCreatedInspection] = useState<Inspection | null>(null);
  const [hoveredObjectIndex, setHoveredObjectIndex] = useState<number | null>(null);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load initial sample if requested
  useEffect(() => {
    if (initialSampleId) {
      const sample = SAMPLE_IMAGES.find((s) => s.id === initialSampleId);
      if (sample) {
        setSelectedDomain(sample.domain);
        setSelectedImageUrl(sample.url);
        setStrictnessLevel(sample.recommendedStrictness);
        setNotes(sample.suggestedPrompt);
      }
    } else if (!selectedImageUrl) {
      // Default to first sample for instant exploration
      const defaultSample = SAMPLE_IMAGES[0];
      setSelectedImageUrl(defaultSample.url);
      setNotes(defaultSample.suggestedPrompt);
    }
  }, [initialSampleId]);

  const currentProfile = DOMAIN_PROFILES.find((p) => p.id === selectedDomain) || DOMAIN_PROFILES[0];

  const handleDomainChange = (domain: InspectionDomain) => {
    setSelectedDomain(domain);
    const profile = DOMAIN_PROFILES.find((p) => p.id === domain);
    if (profile && !notes) {
      setNotes(profile.defaultNotes);
    }
  };

  const handleSelectSample = (sample: SampleImage) => {
    setSelectedDomain(sample.domain);
    setSelectedImageUrl(sample.url);
    setStrictnessLevel(sample.recommendedStrictness);
    setNotes(sample.suggestedPrompt);
    setAnalysisResult(null);
    setCreatedInspection(null);
    setErrorMessage(null);
  };

  const handleImageSelected = (base64OrUrl: string) => {
    setSelectedImageUrl(base64OrUrl);
    setAnalysisResult(null);
    setCreatedInspection(null);
    setErrorMessage(null);
  };

  const handleClear = () => {
    setSelectedImageUrl(null);
    setAnalysisResult(null);
    setCreatedInspection(null);
    setErrorMessage(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImageUrl) {
      setErrorMessage("Please upload or select an image asset to inspect.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: selectedDomain,
          userId: 1,
          image: selectedImageUrl,
          notes,
          enableBoundingBoxes,
          strictnessLevel,
          customPromptOverride,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Analysis failed");
      }

      setAnalysisResult(data.aiAnalysis);
      setCreatedInspection(data.inspection);
      if (onInspectionCreated && data.inspection) {
        onInspectionCreated(data.inspection);
      }
    } catch (err: any) {
      console.error("Error running visual inspection:", err);
      setErrorMessage(err.message || "An unexpected error occurred during inspection analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const detectedObjects: DetectedObject[] = analysisResult?.detectedObjects || [];
  const verdict = analysisResult?.inspectionVerdict || "PASS";

  const verdictPill = {
    PASS: {
      bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      label: "PASS • Quality Standard Met",
    },
    WARN: {
      bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: AlertTriangle,
      label: "WARN • Potential Deviation",
    },
    FAIL: {
      bg: "bg-rose-500/10 text-rose-400 border-rose-500/30",
      icon: XCircle,
      label: "FAIL • Critical Non-Conformance",
    },
    FLAGGED: {
      bg: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      icon: AlertTriangle,
      label: "FLAGGED • Human QA Review Required",
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

  const VerdictIcon = verdictPill.icon;

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Visual Analysis Workspace
            </h1>
            <span className="rounded-md bg-cyan-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-cyan-400 border border-cyan-500/20">
              Interactive Workbench
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Powered by Google Gemini 3.8 Flash Multimodal • Normalized 0-1000 coordinate plane
          </p>
        </div>

        {/* Quick action controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing || !selectedImageUrl}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Running Gemini Vision...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                <span>Run Visual Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) | Right Canvas & Output (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Asset Upload & Inspection Configuration */}
        <div className="lg:col-span-5 space-y-6">
          {/* Domain Selection Tabs */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
              1. Target Domain Profile
            </span>

            <div className="grid grid-cols-2 gap-2">
              {DOMAIN_PROFILES.map((profile) => {
                const isSelected = selectedDomain === profile.id;
                const icons = {
                  Cpu: Cpu,
                  ShoppingBag: ShoppingBag,
                  Activity: Activity,
                  Eye: Eye,
                };
                const Icon = icons[profile.iconName as keyof typeof icons] || Layers;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => handleDomainChange(profile.id)}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/10"
                        : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1.5">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                      {isSelected && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-semibold">{profile.title.split(" ")[0]}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 line-clamp-1">
                      {profile.title}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg bg-slate-950/70 border border-slate-800/80 p-2.5 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">
                {currentProfile.title} Focus:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {currentProfile.shortDesc}
              </p>
            </div>
          </div>

          {/* Visual Asset Upload */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-3">
              2. Visual Media Input
            </span>

            <ImageDropzone
              selectedImageUrl={selectedImageUrl}
              onImageSelected={handleImageSelected}
              onClear={handleClear}
              selectedDomain={selectedDomain}
              onSelectSampleImage={handleSelectSample}
            />
          </div>

          {/* Inspection Parameters & Advisory Configuration */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                3. Inspection Parameters
              </span>
              <button
                type="button"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                {isAdvancedOpen ? "Simple Mode" : "Advanced Prompting"}
              </button>
            </div>

            {/* Strictness Level */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Defect Strictness & Sensitivity Threshold
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "medium", "high"] as StrictnessLevel[]).map((level) => {
                  const isActive = strictnessLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setStrictnessLevel(level)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium uppercase font-mono transition-all ${
                        isActive
                          ? level === "high"
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                            : level === "medium"
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bounding Box extraction switch */}
            <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div>
                <span className="text-xs font-medium text-slate-200 block">
                  Enable Normalized Bounding Box Coordinates
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Scale: [ymin, xmin, ymax, xmax] 0-1000
                </span>
              </div>
              <input
                type="checkbox"
                checked={enableBoundingBoxes}
                onChange={(e) => setEnableBoundingBoxes(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
              />
            </div>

            {/* Inspector Notes */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Inspector Notes / Focus Directives
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Inspect IC pins 14-16 for micro solder bridges or count SKU facings..."
                rows={2}
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            {/* Advanced Prompt Override Drawer */}
            {isAdvancedOpen && (
              <div className="pt-2 border-t border-slate-800/80">
                <label className="text-xs font-medium text-cyan-300 block mb-1">
                  Custom AI Prompt Override (Domain Engineering)
                </label>
                <textarea
                  value={customPromptOverride}
                  onChange={(e) => setCustomPromptOverride(e.target.value)}
                  placeholder="Optional prompt supplement passed to Gemini multimodal model..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Inspection Error</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: HTML5 Canvas Visual Overlay & Detailed Findings */}
        <div className="lg:col-span-7 space-y-6">
          {selectedImageUrl ? (
            <div className="space-y-4">
              {/* Canvas Component */}
              <AnalysisCanvas
                imageUrl={selectedImageUrl}
                detectedObjects={detectedObjects}
                isAnalyzing={isAnalyzing}
                hoveredIndex={hoveredObjectIndex}
                onHoverIndex={setHoveredObjectIndex}
                selectedObjectId={selectedObjectIndex}
                onSelectObject={setSelectedObjectIndex}
              />

              {/* Analysis Results Cards */}
              {analysisResult && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl space-y-5">
                  {/* Verdict & Metrics Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${verdictPill.bg}`}
                      >
                        <VerdictIcon className="h-4 w-4" />
                        <span>{verdictPill.label}</span>
                      </div>
                      <span className="rounded bg-slate-800 px-2.5 py-1 text-xs font-mono text-slate-300 border border-slate-700">
                        {selectedDomain}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-mono text-slate-400 block">
                          Confidence
                        </span>
                        <span className="font-mono text-sm font-bold text-cyan-400">
                          {analysisResult.overallConfidence.toFixed(1)}%
                        </span>
                      </div>

                      {createdInspection && (
                        <button
                          type="button"
                          onClick={() => setIsReportModalOpen(true)}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors shadow"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Report</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-1.5">
                      Visual Intelligence Assessment
                    </span>
                    <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
                      {analysisResult.summary}
                    </p>
                  </div>

                  {/* Domain Insights */}
                  {analysisResult.domainInsights && analysisResult.domainInsights.length > 0 && (
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block mb-2">
                        Engineering Compliance Insights
                      </span>
                      <div className="space-y-1.5">
                        {analysisResult.domainInsights.map((insight, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded border border-slate-800/60"
                          >
                            <span className="text-cyan-400 font-mono shrink-0">▸</span>
                            <span>{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detected Objects Inspector List */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                        Classified Detections & Spatial Coordinates ({detectedObjects.length})
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Hover card to highlight on canvas
                      </span>
                    </div>

                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {detectedObjects.map((obj, idx) => {
                        const isHovered = hoveredObjectIndex === idx;
                        return (
                          <div
                            key={idx}
                            onMouseEnter={() => setHoveredObjectIndex(idx)}
                            onMouseLeave={() => setHoveredObjectIndex(null)}
                            onClick={() => setSelectedObjectIndex(idx)}
                            className={`rounded-lg border p-3 transition-all cursor-pointer ${
                              isHovered
                                ? "border-cyan-400 bg-cyan-950/30"
                                : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-white">
                                {obj.label}
                              </span>
                              <span className="font-mono text-xs font-bold text-cyan-400">
                                {Number(obj.confidence).toFixed(1)}%
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-300">
                              {obj.details}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-1.5">
                              <span>Box 2D: [{obj.box_2d.join(", ")}]</span>
                              <span className="text-slate-400">
                                [{Math.round((obj.box_2d[2] - obj.box_2d[0]) / 10)}% ×{" "}
                                {Math.round((obj.box_2d[3] - obj.box_2d[1]) / 10)}% frame]
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-center min-h-[400px]">
              <Eye className="h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-200">
                Visual Viewport Standby
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                Upload an image or pick a 1-click enterprise test benchmark to start the
                Gemini visual intelligence pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Report Modal */}
      {createdInspection && isReportModalOpen && (
        <ReportModal
          inspection={createdInspection}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </div>
  );
};
