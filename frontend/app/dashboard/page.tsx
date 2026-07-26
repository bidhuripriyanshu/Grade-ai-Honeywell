"use client";

import React, { useEffect, useState } from "react";
import { RiskMeter } from "@/components/RiskMeter";
import { ParameterCard } from "@/components/ParameterCard";
import { TrendChart } from "@/components/TrendChart";
import { SimilarCasesTable } from "@/components/SimilarCasesTable";
import { RecommendationCard } from "@/components/RecommendationCard";
import { ShapChart } from "@/components/ShapChart";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { LiveTestDrawer } from "@/components/LiveTestDrawer";
import { RefreshCw, Play, Zap, Brain, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agent?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch { /* Fallback */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTestDataApplied = (testResult: any) => {
    setData(testResult);
    setLastUpdated(`${new Date().toLocaleTimeString()} (Live Test Data)`);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 pb-16 industrial-grid min-h-screen px-4 sm:px-6 py-6">

      {/* ── Hero Control Bar ── */}
      <div className="glass-red rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fade-in-down relative overflow-hidden">
        <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none rounded-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-white tracking-tight">HONEYWELL GRADE CHANGE</h1>
            <div className="flex items-center gap-1.5">
              <Brain className="w-5 h-5 text-red-400" />
              <span className="text-gradient-red text-2xl font-black">AI COPILOT</span>
            </div>
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[10px] font-extrabold">
              PHASE 12 · PRODUCTION
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Real-time Off-Spec Prevention &nbsp;·&nbsp; LangGraph Orchestrated &nbsp;·&nbsp; SHAP Explainable &nbsp;·&nbsp; Grade A → B
            {lastUpdated && <span className="ml-2 text-slate-500">· Updated {lastUpdated}</span>}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Live API Combination Tester Button */}
          <LiveTestDrawer onTestDataApplied={handleTestDataApplied} />

          <Button
            id="re-evaluate-btn"
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 border-slate-700 font-bold text-xs hover:border-slate-600 gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            {loading ? "Evaluating..." : "Re-evaluate"}
          </Button>

          <Badge variant="outline" className="bg-red-600/20 text-red-400 border-red-500/30 font-black glow-red-sm animate-pulse gap-1.5 px-3.5 py-2.5 text-xs">
            <Play className="w-3.5 h-3.5 fill-current" />
            LIVE Transition
          </Badge>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-bold gap-1.5 px-3.5 py-2.5 text-xs">
            <Zap className="w-3.5 h-3.5" />
            {data?.engine?.includes("LangGraph") ? "LangGraph" : "Workflow"} Active
          </Badge>
        </div>
      </div>

      {/* ── Process Timeline ── */}
      <ProcessTimeline />

      {/* ── Tabs Layout ── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-950/80 border border-slate-800 mb-5 w-full sm:w-auto">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs font-semibold">
            Overview
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs font-semibold">
            SHAP &amp; Trends
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400 text-xs font-semibold">
            Historical Cases
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-5 mt-0">
          {/* Risk Meter + Parameters */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1 animate-scale-pop">
              {loading ? (
                <Skeleton className="h-72 w-full rounded-2xl bg-slate-900" />
              ) : (
                <RiskMeter risk={data?.risk ?? 99.95} prediction={data?.prediction ?? "Off Spec"} />
              )}
            </div>
            <div className="lg:col-span-2 animate-fade-in-up delay-100">
              {loading ? (
                <Skeleton className="h-72 w-full rounded-2xl bg-slate-900" />
              ) : (
                <ParameterCard parameters={data?.current_parameters} />
              )}
            </div>
          </div>

          {/* Recommendations + Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {loading ? (
              <>
                <Skeleton className="h-64 rounded-2xl bg-slate-900" />
                <Skeleton className="h-64 rounded-2xl bg-slate-900" />
              </>
            ) : (
              <>
                <RecommendationCard recommendations={data?.recommendations} llm_explanation={data?.llm_explanation} />
                <ShapChart explanation={{ feature_importance: data?.shap }} />
              </>
            )}
          </div>

          <FeedbackButtons />
        </TabsContent>

        {/* SHAP & Trends Tab */}
        <TabsContent value="analysis" className="space-y-5 mt-0">
          <TrendChart />
          <ShapChart explanation={{ feature_importance: data?.shap }} />
        </TabsContent>

        {/* Historical Cases Tab */}
        <TabsContent value="history" className="mt-0">
          <SimilarCasesTable cases={data?.similar_cases} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
