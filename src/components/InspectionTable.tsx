import React from "react";
import {
  FileText,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Inspection } from "../types/vision.ts";

interface InspectionTableProps {
  inspections: Inspection[];
  isLoading: boolean;
  onSelectInspection: (inspection: Inspection) => void;
  onDeleteInspection?: (id: number) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const InspectionTable: React.FC<InspectionTableProps> = ({
  inspections,
  isLoading,
  onSelectInspection,
  onDeleteInspection,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mb-3" />
        <span className="text-xs font-mono">Querying database records...</span>
      </div>
    );
  }

  if (inspections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center">
        <FileText className="h-10 w-10 text-slate-600 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">No inspection records found</h4>
        <p className="mt-1 text-xs text-slate-500 max-w-sm">
          Run your first visual analysis in the Workspace or adjust your search filter.
        </p>
      </div>
    );
  }

  const getVerdictPill = (inspection: Inspection) => {
    const rawAi = inspection.raw_ai_response || {};
    const verdict = rawAi.inspectionVerdict || (inspection.confidence_score > 95 ? "PASS" : "WARN");

    if (verdict === "PASS") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" />
          PASS
        </span>
      );
    }
    if (verdict === "FAIL") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">
          <XCircle className="h-3 w-3" />
          FAIL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/20">
        <AlertTriangle className="h-3 w-3" />
        WARN
      </span>
    );
  };

  const handleDownloadSingle = (e: React.MouseEvent, inspection: Inspection) => {
    e.stopPropagation();
    const blob = new Blob([JSON.stringify(inspection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inspection_${inspection.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (onDeleteInspection) {
      if (confirm(`Delete inspection record #${id}?`)) {
        onDeleteInspection(id);
      }
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 bg-slate-950/80 font-mono text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">ID & Media</th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Summary & Findings</th>
              <th className="px-4 py-3">Verdict</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {inspections.map((insp) => {
              const conf = Number(insp.confidence_score) || 0;
              const objCount =
                insp.detected_objects?.length ||
                insp.raw_ai_response?.detectedObjects?.length ||
                0;

              return (
                <tr
                  key={insp.id}
                  onClick={() => onSelectInspection(insp)}
                  className="group cursor-pointer transition-colors hover:bg-slate-800/40"
                >
                  {/* ID & Media preview */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-950 border border-slate-800">
                        <img
                          src={insp.image_url}
                          alt="Thumbnail"
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                        />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-slate-200 group-hover:text-cyan-400">
                          #{insp.id.toString().padStart(4, "0")}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {objCount} detections
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Domain */}
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] text-slate-300 border border-slate-700/60">
                      {insp.domain}
                    </span>
                  </td>

                  {/* Summary */}
                  <td className="px-4 py-3 max-w-xs sm:max-w-md">
                    <p className="line-clamp-2 text-slate-300">
                      {insp.summary || "Inspection analysis completed."}
                    </p>
                  </td>

                  {/* Verdict */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getVerdictPill(insp)}
                  </td>

                  {/* Confidence */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-24">
                      <div className="flex items-center justify-between font-mono text-[11px] text-slate-300 mb-1">
                        <span>{conf.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          style={{ width: `${conf}%` }}
                          className={`h-full rounded-full ${
                            conf >= 90
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                              : conf >= 75
                              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                              : "bg-gradient-to-r from-rose-500 to-orange-400"
                          }`}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                    {new Date(insp.created_at).toLocaleDateString()}{" "}
                    <span className="text-slate-600 block text-[10px]">
                      {new Date(insp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectInspection(insp);
                        }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-cyan-400 transition-colors"
                        title="View Detailed Report"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDownloadSingle(e, insp)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                        title="Download JSON Report"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {onDeleteInspection && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, insp.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
                          title="Delete Inspection"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950/80 px-4 py-3 text-xs text-slate-400">
          <div>
            Showing Page <span className="font-mono text-white font-semibold">{currentPage}</span> of{" "}
            <span className="font-mono text-white font-semibold">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-3 py-1.5 text-xs text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
