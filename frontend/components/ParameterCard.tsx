"use client";

import React from "react";
import { Flame, Gauge, Droplets, Wind, Layers, Scale, AlertOctagon, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ParametersProps {
  parameters?: {
    machine_speed?: number;
    steam_pressure?: number;
    stock_flow?: number;
    moisture?: number;
    ash?: number;
    basis_weight?: number;
    recipe?: string;
  };
}

export function ParameterCard({ parameters }: ParametersProps) {
  const params = [
    {
      name: "Steam Pressure", val: parameters?.steam_pressure ?? 9.8, unit: "bar",
      icon: Flame, target: "8.0–9.0", min: 8.0, max: 9.0,
      isAlert: (parameters?.steam_pressure ?? 9.8) > 9.0 || (parameters?.steam_pressure ?? 9.8) < 8.0,
      alertMsg: (parameters?.steam_pressure ?? 9.8) > 9.0 ? "High ↑" : "Low ↓",
      tooltip: "Target: 8.0–9.0 bar. Controls drying cylinder temperature.",
    },
    {
      name: "Machine Speed", val: parameters?.machine_speed ?? 950, unit: "RPM",
      icon: Gauge, target: "800–940", min: 800, max: 940,
      isAlert: (parameters?.machine_speed ?? 950) > 940, alertMsg: "High ↑",
      tooltip: "Target: 800–940 RPM. Affects sheet formation uniformity.",
    },
    {
      name: "Moisture", val: parameters?.moisture ?? 4.7, unit: "%",
      icon: Droplets, target: "4.8–7.2", min: 4.8, max: 7.2,
      isAlert: (parameters?.moisture ?? 4.7) < 4.8 || (parameters?.moisture ?? 4.7) > 7.2,
      alertMsg: (parameters?.moisture ?? 4.7) < 4.8 ? "Low ↓" : "High ↑",
      tooltip: "Target: 4.8–7.2%. Low moisture causes brittleness.",
    },
    {
      name: "Stock Flow", val: parameters?.stock_flow ?? 105, unit: "L/min",
      icon: Wind, target: "95–120", min: 95, max: 120, isAlert: false, alertMsg: "",
      tooltip: "Target: 95–120 L/min. Fibre suspension feed rate.",
    },
    {
      name: "Ash Content", val: parameters?.ash ?? 12.0, unit: "%",
      icon: Layers, target: "10–15", min: 10, max: 15,
      isAlert: (parameters?.ash ?? 12.0) > 15.0, alertMsg: "High ↑",
      tooltip: "Target: 10–15%. Filler mineral ratio in paper.",
    },
    {
      name: "Basis Weight", val: parameters?.basis_weight ?? 80.0, unit: "g/m²",
      icon: Scale, target: "76–84", min: 76, max: 84,
      isAlert: (parameters?.basis_weight ?? 80.0) < 76 || (parameters?.basis_weight ?? 80.0) > 84,
      alertMsg: "Off Spec",
      tooltip: "Target: 76–84 g/m². Primary quality output metric.",
    },
  ];

  const alertCount = params.filter((p) => p.isAlert).length;

  const getBarPct = (val: number, min: number, max: number) => {
    const expanded = max - min;
    const center = (min + max) / 2;
    const from = center - expanded * 0.6;
    const to = center + expanded * 0.6;
    return Math.max(0, Math.min(100, ((val - from) / (to - from)) * 100));
  };

  return (
    <Card className="glass border-slate-800/60 shadow-xl animate-fade-in">
      <CardHeader className="pb-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Live Machine Parameters</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              Recipe: {parameters?.recipe || "Recipe A"}
            </span>
            {alertCount > 0 ? (
              <Badge variant="destructive" className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black animate-pulse gap-1">
                <AlertOctagon className="w-3 h-3" />
                {alertCount} Alert{alertCount > 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1">
                <CheckCircle2 className="w-3 h-3" />
                All Normal
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {params.map((item, idx) => {
              const Icon = item.icon;
              const barPct = getBarPct(item.val, item.min, item.max);
              const isCenter = barPct >= 30 && barPct <= 70;

              return (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <div
                      className={`relative p-3.5 rounded-xl border transition-all duration-300 group cursor-default overflow-hidden animate-fade-in-up ${
                        item.isAlert
                          ? "border-red-500/40 bg-red-950/20 glow-red-sm"
                          : "border-slate-800/70 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/50"
                      }`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {item.isAlert && (
                        <div className="absolute inset-0 animate-shimmer opacity-20 rounded-xl pointer-events-none" />
                      )}
                      <div className="flex items-center justify-between mb-2 relative z-10">
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-300 transition-colors">
                          {item.name}
                        </span>
                        <Icon className={`w-3.5 h-3.5 transition-colors ${item.isAlert ? "text-red-400" : "text-slate-600 group-hover:text-cyan-400"}`} />
                      </div>
                      <div className="flex items-baseline gap-1 relative z-10">
                        <span className={`text-xl font-black tracking-tight ${item.isAlert ? "text-red-400" : "text-white"}`}>
                          {typeof item.val === "number" ? item.val.toFixed(1) : item.val}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                        {item.isAlert && (
                          <span className="ml-auto text-[10px] font-black text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
                            {item.alertMsg}
                          </span>
                        )}
                      </div>
                      <div className="mt-2.5 relative z-10">
                        <Progress
                          value={barPct}
                          className="h-1 bg-slate-800"
                          style={{
                            // @ts-ignore
                            "--progress-color": item.isAlert ? "#E31837" : isCenter ? "#10b981" : "#f59e0b"
                          } as React.CSSProperties}
                        />
                        <div className="flex justify-between mt-1">
                          <span className="text-[9px] text-slate-600 font-mono">{item.target}</span>
                          {!item.isAlert && <span className="text-[9px] text-emerald-600 font-bold">Normal</span>}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-slate-900 border-slate-700 text-slate-300 text-xs max-w-[200px]">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
