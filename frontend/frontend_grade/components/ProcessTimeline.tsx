"use client";

import React, { useState, useRef } from "react";
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  Info,
  Sparkles,
  Sliders,
  Check,
  Brain
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export interface TimelineStep {
  id: number;
  phase: string;
  label: string;
  status: "complete" | "active" | "pending" | "alert";
  time?: string;
  detail?: string;
  fullDescription?: string;
  parameters?: { name: string; value: string; status: "normal" | "warning" | "optimal" }[];
}

const DEFAULT_STEPS: TimelineStep[] = [
  { 
    id: 1, 
    phase: "01", 
    label: "Grade A Stabilized", 
    status: "complete", 
    time: "06:12", 
    detail: "Baseline parameters locked. Recipe A confirmed.",
    fullDescription: "All DCS sensors report steady-state operation for Grade A paper reel production. Moisture and basis weight are within ±0.1% tolerance.",
    parameters: [
      { name: "Basis Weight", value: "60.2 g/m²", status: "optimal" },
      { name: "Moisture", value: "4.5%", status: "optimal" },
      { name: "Machine Speed", value: "950 RPM", status: "normal" }
    ]
  },
  { 
    id: 2, 
    phase: "02", 
    label: "Transition Initiated", 
    status: "complete", 
    time: "06:25", 
    detail: "Grade change sequence triggered by DCS operator.",
    fullDescription: "Operator triggered DCS Grade Transition A → B protocol. Target recipe parameters pushed to automated actuators.",
    parameters: [
      { name: "Steam Ramp Rate", value: "+0.1 bar/min", status: "normal" },
      { name: "Stock Flow Target", value: "420 L/min", status: "normal" }
    ]
  },
  { 
    id: 3, 
    phase: "03", 
    label: "XGBoost Risk Assessment", 
    status: "complete", 
    time: "06:26", 
    detail: "Off-Spec Risk: 99.9%. Anomaly detected.",
    fullDescription: "Machine learning anomaly detection model flagged severe off-spec paper defect risk due to un-synchronized speed ramp & steam pressure spikes.",
    parameters: [
      { name: "Off-Spec Probability", value: "99.9%", status: "warning" },
      { name: "Primary Driver", value: "Steam Pressure", status: "warning" }
    ]
  },
  { 
    id: 4, 
    phase: "04", 
    label: "Historical Match Found", 
    status: "complete", 
    time: "06:26", 
    detail: "Transition #233 matched at 98.2% similarity.",
    fullDescription: "Vector database search matched current DCS parameter trajectory to historical transition #233 (Grade 60 → 80 g/m²), which successfully recovered off-spec conditions.",
    parameters: [
      { name: "Matched Transition", value: "#233 (June 2024)", status: "optimal" },
      { name: "Similarity Index", value: "98.2%", status: "optimal" }
    ]
  },
  { 
    id: 5, 
    phase: "05", 
    label: "AI Recommendations", 
    status: "active", 
    time: "06:27", 
    detail: "Reduce steam by 0.2 bar. Adjust speed by 5%.",
    fullDescription: "Groq LLM + SHAP optimization agent generated corrective DCS action plan to maintain paper moisture and prevent reel tear.",
    parameters: [
      { name: "Steam Target", value: "9.6 bar (-0.2)", status: "warning" },
      { name: "Speed Target", value: "902 RPM (-5%)", status: "warning" },
      { name: "Estimated Risk Drop", value: "99.9% → 28.1%", status: "optimal" }
    ]
  },
  { 
    id: 6, 
    phase: "06", 
    label: "Operator Decision", 
    status: "pending", 
    time: "—", 
    detail: "Awaiting operator Accept / Override action.",
    fullDescription: "System is waiting for DCS operator approval to auto-apply recommended setpoints to DCS controllers.",
    parameters: [
      { name: "Approval Status", value: "Pending Input", status: "normal" }
    ]
  },
  { 
    id: 7, 
    phase: "07", 
    label: "Grade B Stabilization", 
    status: "pending", 
    time: "—", 
    detail: "Target: Basis weight 80 g/m², Moisture 5.2%.",
    fullDescription: "Final steady state verification after setpoint adjustment. Sensors will monitor quality parameters for 10 consecutive minutes.",
    parameters: [
      { name: "Target Basis Wt", value: "80 g/m²", status: "normal" },
      { name: "Target Moisture", value: "5.2%", status: "normal" }
    ]
  },
];

const STATUS_ICONS: Record<string, React.ReactNode> = {
  complete: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
  active:   <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />,
  pending:  <Circle className="w-4 h-4 text-slate-500" />,
  alert:    <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />,
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  complete: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  active:   "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 glow-cyan",
  pending:  "bg-slate-800/80 text-slate-400 border-slate-700/80",
  alert:    "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

interface ProcessTimelineProps {
  steps?: TimelineStep[];
}

export function ProcessTimeline({ steps = DEFAULT_STEPS }: ProcessTimelineProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(5);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completedCount = steps.filter((s) => s.status === "complete").length;
  const activeStep = steps.find((s) => s.status === "active");
  const activePhaseNum = activeStep ? activeStep.id : completedCount;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  const selectedStep = steps.find((s) => s.id === selectedPhaseId) || steps[0];

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Calculate percentage length for the continuous track line fill
  const fillPct = Math.min(100, Math.max(0, ((activePhaseNum - 0.5) / steps.length) * 100));

  return (
    <Card className="glass border-slate-800/80 shadow-2xl animate-fade-in-up relative overflow-hidden">
      {/* Background glow highlight */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-4 border-b border-slate-800/70 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left Title section */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                  Grade Transition Timeline
                </h3>
                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-[10px] font-extrabold px-2 py-0.5">
                  Grade A → Grade B
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] font-mono">
                  DCS Auto-Sync
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time phase tracking &amp; operational safety gate controls
              </p>
            </div>
          </div>

          {/* Right Progress Section */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Phase</span>
                <span className="text-white font-mono font-bold">{activePhaseNum}</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400 font-mono">{steps.length}</span>
                <span className="text-cyan-400 font-bold ml-1.5 font-mono">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="w-28 sm:w-36 h-2 bg-slate-900 border border-slate-800 mt-1" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-700 text-xs font-semibold px-2.5 h-8 gap-1.5 shrink-0"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExpanded ? "Hide Details" : "Inspect Step"}</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-6 relative z-10 space-y-5">
        {/* Scroll Controls (Visible on smaller viewports) */}
        <div className="relative group">
          <button
            onClick={() => handleScroll("left")}
            className="absolute -left-3 top-5 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-all"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => handleScroll("right")}
            className="absolute -right-3 top-5 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center shadow-lg transition-all"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Stepper track container */}
          <div className="relative">
            {/* Background continuous track line */}
            <div className="absolute top-5 left-10 right-10 h-1 bg-slate-800/90 rounded-full z-0 hidden sm:block" />
            
            {/* Active continuous track fill line */}
            <div 
              className="absolute top-5 left-10 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full z-0 transition-all duration-700 hidden sm:block"
              style={{ width: `calc(${fillPct}% - 40px)` }}
            />

            {/* Steps Row */}
            <div
              ref={scrollRef}
              className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 px-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent scroll-smooth"
            >
              {steps.map((step) => {
                const isSelected = selectedStep.id === step.id;
                const isComplete = step.status === "complete";
                const isActive = step.status === "active";
                const isAlert = step.status === "alert";

                return (
                  <div
                    key={step.id}
                    onClick={() => {
                      setSelectedPhaseId(step.id);
                      setIsExpanded(true);
                    }}
                    className={`flex flex-col items-center flex-shrink-0 w-[160px] sm:w-[180px] group cursor-pointer relative z-10 transition-all duration-200 ${
                      isSelected ? "scale-[1.03]" : "opacity-90 hover:opacity-100"
                    }`}
                  >
                    {/* Node Circle */}
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all shadow-md ${
                        isComplete
                          ? "border-emerald-500/80 bg-emerald-950/70 shadow-[0_0_15px_rgba(16,185,129,0.25)] group-hover:border-emerald-400"
                          : isActive
                          ? "border-cyan-400 bg-cyan-950/90 shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse group-hover:border-cyan-300"
                          : isAlert
                          ? "border-amber-500 bg-amber-950/70 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:border-amber-400"
                          : "border-slate-700 bg-slate-900/90 text-slate-500 group-hover:border-slate-500"
                      } ${isSelected ? "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-slate-950" : ""}`}
                    >
                      {STATUS_ICONS[step.status]}
                    </div>

                    {/* Step Card Container */}
                    <div
                      className={`mt-3 w-full p-3 rounded-xl border transition-all text-center flex flex-col items-center min-h-[125px] ${
                        isSelected
                          ? "bg-slate-900/95 border-cyan-500/50 shadow-lg shadow-cyan-950/50"
                          : "bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      {/* Phase Badge */}
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-black font-mono tracking-wider px-2 py-0.5 mb-1.5 ${
                          STATUS_BADGE_STYLES[step.status]
                        }`}
                      >
                        PHASE {step.phase}
                      </Badge>

                      {/* Step Title */}
                      <h4
                        className={`text-xs font-bold leading-snug transition-colors line-clamp-2 ${
                          isComplete
                            ? "text-emerald-300 group-hover:text-emerald-200"
                            : isActive
                            ? "text-cyan-300 group-hover:text-cyan-200"
                            : isAlert
                            ? "text-amber-300 group-hover:text-amber-200"
                            : "text-slate-300 group-hover:text-white"
                        }`}
                      >
                        {step.label}
                      </h4>

                      {/* Step Summary Detail */}
                      <p className="text-[11px] text-slate-400 leading-snug mt-1.5 line-clamp-2 w-full">
                        {step.detail}
                      </p>

                      {/* Step Timestamp */}
                      {step.time && step.time !== "—" && (
                        <div className="mt-auto pt-2 flex items-center justify-center gap-1 text-[10px] font-mono text-slate-400">
                          <Clock className="w-2.5 h-2.5 text-slate-500" />
                          <span>{step.time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Phase Deep-Dive Inspector */}
        {isExpanded && selectedStep && (
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-full bg-cyan-500/5 blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] font-mono font-bold ${STATUS_BADGE_STYLES[selectedStep.status]}`}>
                    PHASE {selectedStep.phase} · {selectedStep.status.toUpperCase()}
                  </Badge>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    {selectedStep.label}
                  </h4>
                  {selectedStep.time && selectedStep.time !== "—" && (
                    <span className="text-xs font-mono text-slate-400">({selectedStep.time})</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedStep.fullDescription || selectedStep.detail}
                </p>
              </div>

              {/* Action / Parameter Metrics Chips */}
              {selectedStep.parameters && selectedStep.parameters.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {selectedStep.parameters.map((p, i) => (
                    <div
                      key={i}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 flex flex-col items-start"
                    >
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{p.name}</span>
                      <span className={`text-xs font-bold font-mono ${
                        p.status === "warning" ? "text-amber-400" : p.status === "optimal" ? "text-emerald-400" : "text-cyan-300"
                      }`}>
                        {p.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

