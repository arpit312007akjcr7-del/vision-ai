/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Navbar, NavTab } from "./components/Navbar.tsx";
import { DashboardPage } from "./pages/DashboardPage.tsx";
import { AnalyzePage } from "./pages/AnalyzePage.tsx";
import { HistoryPage } from "./pages/HistoryPage.tsx";
import { AnalyticsPage } from "./pages/AnalyticsPage.tsx";
import { Inspection, InspectionDomain } from "./types/vision.ts";
import { Scan, Shield, Terminal, CheckCircle2 } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");
  const [analyzeInitialDomain, setAnalyzeInitialDomain] = useState<InspectionDomain | undefined>(undefined);
  const [analyzeInitialSampleId, setAnalyzeInitialSampleId] = useState<string | undefined>(undefined);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleNavigateToAnalyze = (domain?: InspectionDomain, sampleId?: string) => {
    setAnalyzeInitialDomain(domain);
    setAnalyzeInitialSampleId(sampleId);
    setCurrentTab("analyze");
  };

  const handleInspectionCreated = (newInspection: Inspection) => {
    showToast(`Inspection #${newInspection.id} analyzed and recorded in database!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onNewScan={() => handleNavigateToAnalyze()}
      />

      {/* Main Page Content */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === "dashboard" && (
          <DashboardPage
            onNavigateToAnalyze={handleNavigateToAnalyze}
            onNavigateToHistory={() => setCurrentTab("history")}
            onNavigateToAnalytics={() => setCurrentTab("analytics")}
          />
        )}

        {currentTab === "analyze" && (
          <AnalyzePage
            initialDomain={analyzeInitialDomain}
            initialSampleId={analyzeInitialSampleId}
            onInspectionCreated={handleInspectionCreated}
          />
        )}

        {currentTab === "history" && <HistoryPage />}

        {currentTab === "analytics" && <AnalyticsPage />}
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-slate-900/95 px-4 py-3 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-white">Visual Analysis Completed</div>
            <div className="text-slate-300 font-mono text-[11px]">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Scan className="h-4 w-4 text-cyan-400" />
            <span className="font-semibold text-slate-400">VisionAI Core</span>
            <span>• Enterprise Visual Intelligence Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Gemini 3.8 Flash Multimodal</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>RLS PostgreSQL Isolated</span>
            </div>
            <span>•</span>
            <span>Scale: 0-1000 Coordinate Matrix</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
