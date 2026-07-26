"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from "recharts";
import { BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FeatureImportanceItem {
  feature: string;
  impact: number;
  value?: number | string;
}

interface ShapChartProps {
  explanation?: {
    feature_importance?: FeatureImportanceItem[];
    risk?: number;
    base_risk?: number;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    const positive = d.impact >= 0;
    return (
      <div className="glass rounded-xl p-3 border border-slate-700 shadow-2xl min-w-[160px]">
        <p className="text-xs font-black text-white mb-1">{d.feature}</p>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black ${positive ? "text-red-400" : "text-emerald-400"}`}>
            {positive ? "+" : ""}{d.impact}%
          </span>
          <span className="text-[10px] text-slate-400">risk impact</span>
        </div>
        {d.value !== undefined && (
          <p className="text-[11px] text-slate-500 mt-1">
            Current: <span className="text-slate-300 font-mono">{d.value}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function ShapChart({ explanation }: ShapChartProps) {
  const defaultImportance: FeatureImportanceItem[] = [
    { feature: "Steam Pressure", impact: 40.0, value: "9.8 bar" },
    { feature: "Machine Speed", impact: 28.0, value: "950 RPM" },
    { feature: "Moisture", impact: 15.0, value: "4.7%" },
    { feature: "Stock Flow", impact: 10.0, value: "105 L/min" },
    { feature: "Ash Content", impact: 4.0, value: "12.0%" },
    { feature: "Basis Weight", impact: -5.0, value: "80.0 g/m²" },
  ];

  const data = explanation?.feature_importance || defaultImportance;
  const topDriver = [...data].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))[0];

  return (
    <Card className="glass border-slate-800/60 shadow-xl animate-fade-in-up delay-300 relative overflow-hidden">
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">SHAP Risk Drivers</h3>
          </div>
          {topDriver && (
            <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-400 text-[10px] font-bold gap-1">
              <Zap className="w-3 h-3" />
              Top: {topDriver.feature} ({topDriver.impact > 0 ? "+" : ""}{topDriver.impact}%)
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 40, left: 30, bottom: 4 }}>
              <defs>
                <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#E31837" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} opacity={0.5} />
              <XAxis type="number" stroke="#475569" fontSize={10} unit="%" tickLine={false}
                axisLine={{ stroke: "#334155" }} style={{ fontFamily: "JetBrains Mono, monospace" }} />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" fontSize={11}
                tickLine={false} axisLine={false} width={110} style={{ fontFamily: "Inter, sans-serif" }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(148,163,184,0.04)" }} />
              <ReferenceLine x={0} stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" />
              <Bar dataKey="impact" radius={[0, 5, 5, 0]} maxBarSize={18}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.impact >= 0 ? "url(#redGrad)" : "url(#greenGrad)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <Separator className="my-3 bg-slate-800/60" />

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-700 to-red-400 inline-block shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
              Increases Off-Spec Risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-emerald-600 to-emerald-400 inline-block shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
              Reduces Off-Spec Risk
            </span>
          </div>
          <span className="text-slate-600 font-mono text-[10px] hidden sm:block">SHAP v0.41</span>
        </div>
      </CardContent>
    </Card>
  );
}
