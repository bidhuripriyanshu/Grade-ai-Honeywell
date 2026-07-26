"use client";

import React from "react";
import { CheckCircle2, Circle, Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TimelineStep {
  id: number;
  phase: string;
  label: string;
  status: "complete" | "active" | "pending" | "alert";
  time?: string;
  detail?: string;
}

const STEPS: TimelineStep[] = [
  { id: 1, phase: "01", label: "Grade A Stabilized", status: "complete", time: "06:12", detail: "Baseline parameters locked. Recipe A confirmed." },
  { id: 2, phase: "02", label: "Transition Initiated", status: "complete", time: "06:25", detail: "Grade change sequence triggered by DCS operator." },
  { id: 3, phase: "03", label: "XGBoost Risk Assessment", status: "complete", time: "06:26", detail: "Off-Spec Risk: 99.9%. Anomaly detected." },
  { id: 4, phase: "04", label: "Historical Match Found", status: "complete", time: "06:26", detail: "Transition #233 matched at 98.2% similarity." },
  { id: 5, phase: "05", label: "AI Recommendations", status: "active", time: "06:27", detail: "Reduce steam by 0.2 bar. Adjust speed by 5%." },
  { id: 6, phase: "06", label: "Operator Decision", status: "pending", time: "—", detail: "Awaiting operator Accept / Override action." },
  { id: 7, phase: "07", label: "Grade B Stabilization", status: "pending", time: "—", detail: "Target: Basis weight 80 g/m², Moisture 5.2%." },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  complete: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  active:   <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />,
  pending:  <Circle className="w-4 h-4 text-slate-600" />,
  alert:    <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />,
};

const STATUS_RING: Record<string, string> = {
  complete: "border-emerald-500/50 bg-emerald-950/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
  active:   "border-cyan-500/60 bg-cyan-950/30 shadow-[0_0_16px_rgba(6,182,212,0.3)]",
  pending:  "border-slate-700 bg-slate-900/30",
  alert:    "border-amber-500/50 bg-amber-950/30",
};

const STATUS_LINE: Record<string, string> = {
  complete: "bg-emerald-500/40",
  active:   "bg-gradient-to-b from-cyan-500/50 to-slate-700/40",
  pending:  "bg-slate-800",
  alert:    "bg-amber-500/30",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  complete: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  active:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  pending:  "bg-slate-800/60 text-slate-500 border-slate-700",
  alert:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export function ProcessTimeline() {
  const completedCount = STEPS.filter((s) => s.status === "complete").length;
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  return (
    <Card className="glass border-slate-800/60 shadow-xl animate-fade-in-up">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Grade Transition Timeline</h3>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 text-[10px] font-bold">A → B</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">{completedCount}/{STEPS.length} phases</span>
            <Progress value={progressPct} className="w-16 h-1.5 bg-slate-800" />
            <span className="text-xs text-cyan-400 font-bold">{progressPct}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="flex gap-0 overflow-x-auto pb-2">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex items-start gap-0 flex-shrink-0">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center ${STATUS_RING[step.status]}`}>
                  {STATUS_ICONS[step.status]}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex items-center h-0.5 w-12 mt-4 -mr-12 relative z-0">
                    <div className={`h-0.5 w-full ${STATUS_LINE[step.status]}`} />
                  </div>
                )}
              </div>
              <div className="ml-2 mr-10 min-w-[100px] max-w-[120px]">
                <Badge variant="outline" className={`text-[9px] font-black font-mono mb-1 ${STATUS_BADGE_CLASS[step.status]}`}>
                  PHASE {step.phase}
                </Badge>
                <p className={`text-[11px] font-bold leading-tight ${
                  step.status === "complete" ? "text-emerald-400"
                  : step.status === "active" ? "text-cyan-300"
                  : step.status === "alert" ? "text-amber-400"
                  : "text-slate-600"
                }`}>
                  {step.label}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{step.detail}</p>
                {step.time && step.time !== "—" && (
                  <span className="text-[9px] font-mono text-slate-600 mt-0.5 block">{step.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
