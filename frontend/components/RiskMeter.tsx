"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Cpu, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface RiskMeterProps {
  risk: number;
  prediction: string;
}

export function RiskMeter({ risk, prediction }: RiskMeterProps) {
  const [displayRisk, setDisplayRisk] = useState(0);
  const clampedRisk = Math.min(100, Math.max(0, risk));
  const isHighRisk = clampedRisk >= 70;
  const isModerateRisk = clampedRisk >= 40 && clampedRisk < 70;

  useEffect(() => {
    const duration = 1400;
    const steps = 60;
    const increment = clampedRisk / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, clampedRisk);
      setDisplayRisk(current);
      if (current >= clampedRisk) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [clampedRisk]);

  const size = 200;
  const cx = 100;
  const cy = 110;
  const radius = 78;
  const strokeWidth = 14;
  const startAngle = 180;
  const sweepAngle = 180;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const getArcPoint = (angle: number) => ({
    x: cx + radius * Math.cos(toRad(angle)),
    y: cy + radius * Math.sin(toRad(angle)),
  });

  const describeArc = (pct: number) => {
    const sweep = sweepAngle * (pct / 100);
    const endAngle = startAngle + sweep;
    const start = getArcPoint(startAngle);
    const end = getArcPoint(endAngle);
    const largeArc = sweep > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  };

  const trackPath = describeArc(100);
  const progressPath = describeArc(displayRisk);
  const arcColor = isHighRisk ? "#E31837" : isModerateRisk ? "#f59e0b" : "#10b981";
  const glowColor = isHighRisk
    ? "drop-shadow(0 0 14px rgba(227,24,55,0.7)) drop-shadow(0 0 30px rgba(227,24,55,0.3))"
    : isModerateRisk
    ? "drop-shadow(0 0 14px rgba(245,158,11,0.6))"
    : "drop-shadow(0 0 14px rgba(16,185,129,0.6))";
  const riskLabel = isHighRisk ? "CRITICAL RISK" : isModerateRisk ? "MODERATE RISK" : "NORMAL OPERATION";
  const ringClass = isHighRisk ? "animate-risk-pulse" : "";

  return (
    <Card className={`relative glass-red border-0 shadow-2xl overflow-hidden ${ringClass}`}>
      <div className="absolute inset-0 animate-shimmer pointer-events-none rounded-2xl opacity-30" />

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-widest">Risk Assessment</h3>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] font-black uppercase animate-pulse ${
              isHighRisk
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : isModerateRisk
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
            }`}
          >
            {isHighRisk ? <AlertTriangle className="w-3 h-3 mr-1" /> : <CheckCircle2 className="w-3 h-3 mr-1" />}
            {riskLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative z-10">
        {/* Half-Circle Gauge */}
        <div className="w-full flex justify-center">
          <svg width={size} height={130} viewBox={`0 0 ${size} 130`} className="overflow-visible">
            {[0, 25, 50, 75, 100].map((pct) => {
              const angle = toRad(startAngle + (sweepAngle * pct) / 100);
              const inner = radius - 10;
              const outer = radius + 4;
              return (
                <g key={pct}>
                  <line
                    x1={cx + inner * Math.cos(angle)}
                    y1={cy + inner * Math.sin(angle)}
                    x2={cx + outer * Math.cos(angle)}
                    y2={cy + outer * Math.sin(angle)}
                    stroke="#334155" strokeWidth={1.5}
                  />
                  <text x={cx + (radius - 22) * Math.cos(angle)} y={cy + (radius - 22) * Math.sin(angle)}
                    textAnchor="middle" dominantBaseline="central" className="fill-slate-600"
                    fontSize={8} fontFamily="JetBrains Mono, monospace">
                    {pct}
                  </text>
                </g>
              );
            })}
            <path d={trackPath} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} strokeLinecap="round" />
            <path d={progressPath} fill="none" stroke={arcColor} strokeWidth={strokeWidth} strokeLinecap="round"
              style={{ filter: glowColor, transition: "d 1.4s cubic-bezier(0.4,0,0.2,1), stroke 0.5s" }} />
            {displayRisk > 0 && (() => {
              const angle = startAngle + (sweepAngle * displayRisk) / 100;
              const tip = getArcPoint(angle);
              return <circle cx={tip.x} cy={tip.y} r={6} fill={arcColor} style={{ filter: glowColor }} />;
            })()}
            <text x={cx} y={cy - 14} textAnchor="middle" className="fill-white" fontSize={28} fontWeight={900} fontFamily="Inter, sans-serif">
              {displayRisk.toFixed(1)}%
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" className="fill-slate-400" fontSize={9} fontWeight={600} letterSpacing={2} fontFamily="Inter, sans-serif">
              OFF-SPEC RISK
            </text>
            <text x={cx - radius + 2} y={cy + 20} textAnchor="start" fontSize={9} className="fill-slate-600" fontFamily="Inter">0%</text>
            <text x={cx + radius - 2} y={cy + 20} textAnchor="end" fontSize={9} className="fill-slate-600" fontFamily="Inter">100%</text>
          </svg>
        </div>

        <Separator className="my-3 bg-slate-800/60" />

        {/* Footer stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all group cursor-default">
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Prediction</p>
            </div>
            <p className={`text-sm font-black ${isHighRisk ? "text-red-400" : "text-emerald-400"}`}>
              {prediction || "Off Spec"}
            </p>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60 hover:border-slate-700 transition-all group cursor-default">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition-colors" />
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Model</p>
            </div>
            <p className="text-sm font-black text-slate-200">XGBoost 94.2%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
