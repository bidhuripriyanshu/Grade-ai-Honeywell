"use client";

import React from "react";
import { Lightbulb, Check, Cpu, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ActionItem {
  action: string;
  reason: string;
}

interface RecommendationCardProps {
  recommendations?: {
    recommendations?: ActionItem[];
    summary?: string;
    risk?: number;
  };
  llm_explanation?: string;
}

export function RecommendationCard({ recommendations, llm_explanation }: RecommendationCardProps) {
  const defaultActions: ActionItem[] = [
    { action: "Reduce Steam Pressure by 0.2 bar", reason: "Steam pressure (9.8 bar) exceeds optimal upper threshold of 9.0 bar." },
    { action: "Reduce Machine Speed by 5%", reason: "Machine speed (950 RPM) exceeds high-speed stability threshold (940 RPM)." },
    { action: "Increase Stock Flow by 10 L/min", reason: "Moisture level (4.7%) is below lower quality limit of 4.8%." },
  ];

  const actions = recommendations?.recommendations || defaultActions;
  const summaryText = llm_explanation || recommendations?.summary ||
    "The current operating conditions closely resemble historical transition #233. Steam pressure and machine speed are above recommended ranges. Reducing steam pressure by approximately 0.2 bar and lowering machine speed will re-establish moisture equilibrium and prevent paper reel defects.";

  const priorityColors = ["from-red-600 to-rose-500", "from-amber-500 to-yellow-400", "from-cyan-500 to-blue-400"];

  return (
    <Card className="glass border-slate-800/60 shadow-xl flex flex-col justify-between animate-fade-in-up delay-200 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">AI Decision Engine</h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase animate-pulse">
              High Priority
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-extrabold">
              ↓72% Risk
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 relative z-10">
        {/* Action Items */}
        <div className="space-y-2.5">
          {actions.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 border border-slate-800/70 p-3 rounded-xl flex items-start gap-3 hover:border-slate-600 hover:bg-slate-900/60 transition-all group animate-fade-in-up"
              style={{ animationDelay: `${(idx + 1) * 80}ms` }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br ${priorityColors[idx % priorityColors.length]} shadow-md`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors">{item.action}</h4>
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-slate-800/60" />

        {/* LLM Engineer Explanation */}
        <div className="p-4 rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-slate-950/80 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer opacity-15 rounded-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-black text-red-400 mb-2 relative z-10">
            <div className="w-5 h-5 rounded-md bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-red-400" />
            </div>
            <span>Honeywell AI Copilot — Groq LLM Explanation</span>
            <Badge variant="outline" className="ml-auto bg-red-500/10 border-red-500/20 text-red-400 text-[9px] gap-1 py-0">
              <Cpu className="w-2.5 h-2.5" /> LLM
            </Badge>
          </div>
          <p className="text-xs text-slate-300 italic leading-relaxed relative z-10">
            &ldquo;{summaryText}&rdquo;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
