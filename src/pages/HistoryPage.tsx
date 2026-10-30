import React, { useState, useEffect } from "react";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Download,
  Calendar,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { InspectionTable } from "../components/InspectionTable.tsx";
import { ReportModal } from "../components/ReportModal.tsx";
import { Inspection, InspectionDomain } from "../types/vision.ts";

export const HistoryPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", "10");
      if (selectedDomain !== "All") {
        params.append("domain", selectedDomain);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      const res = await fetch(`/api/inspections?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInspections(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load inspection history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [currentPage, selectedDomain]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInspections();
  };

  const handleDeleteInspection = async (id: number) => {
    try {
      const res = await fetch(`/api/inspections/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInspections((prev) => prev.filter((i) => i.id !== id));
        setTotalCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to delete inspection:", err);
    }
  };

  const handleExportCsv = () => {
    if (inspections.length === 0) return;
    const headers = ["ID", "Domain", "Status", "Confidence", "Summary", "Date"];
    const rows = inspections.map((i) => [
      i.id,
      `"${i.domain.replace(/"/g, '""')}"`,
      i.status,
      Number(i.confidence_score).toFixed(1),
      `"${(i.summary || "").replace(/"/g, '""')}"`,
      new Date(i.created_at).toISOString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `visionai_inspections_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const domains = [
    "All",
    "Manufacturing & Industrial",
    "Retail & Inventory",
    "Medical / Bio-Imaging",
    "General Scene Understanding",
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Inspection History & Audit Logs
            </h1>
            <span className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-mono font-semibold text-indigo-400 border border-indigo-500/20">
              {totalCount} Total Scans
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 font-mono">
            Structured relational inspection repository stored in PostgreSQL with cascading constraints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchInspections}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 shadow-lg">
        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {domains.map((dom) => {
            const isSelected = selectedDomain === dom;
            return (
              <button
                key={dom}
                type="button"
                onClick={() => {
                  setSelectedDomain(dom);
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                {dom === "All" ? "All Domains" : dom.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anomaly, SKU, notes..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 py-1.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
        </form>
      </div>

      {/* Inspections Table */}
      <InspectionTable
        inspections={inspections}
        isLoading={isLoading}
        onSelectInspection={(insp) => setSelectedInspection(insp)}
        onDeleteInspection={handleDeleteInspection}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Detailed Report Modal */}
      {selectedInspection && (
        <ReportModal
          inspection={selectedInspection}
          onClose={() => setSelectedInspection(null)}
        />
      )}
    </div>
  );
};
