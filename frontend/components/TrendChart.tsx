"use client";

import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const generateTimeSeriesData = () => [
  { time: "-30m", steam: 8.5, speed: 890, moisture: 5.6, basisWeight: 80.2 },
  { time: "-25m", steam: 8.7, speed: 900, moisture: 5.4, basisWeight: 80.5 },
  { time: "-20m", steam: 8.9, speed: 915, moisture: 5.2, basisWeight: 79.8 },
  { time: "-15m", steam: 9.2, speed: 930, moisture: 5.0, basisWeight: 80.1 },
  { time: "-10m", steam: 9.5, speed: 940, moisture: 4.9, basisWeight: 79.5 },
  { time: "-5m",  steam: 9.7, speed: 948, moisture: 4.75, basisWeight: 79.9 },
  { time: "Now",  steam: 9.8, speed: 950, moisture: 4.7, basisWeight: 80.0 },
];

const configs = {
  steam:       { label: "Steam Pressure", unit: "bar",   color: "#ef4444", upperLimit: 9.0, lowerLimit: 8.0, domain: [7.5, 10.5] as [number, number] },
  speed:       { label: "Machine Speed",  unit: "RPM",   color: "#00A3E0", upperLimit: 940, lowerLimit: 800, domain: [750, 1000] as [number, number] },
  moisture:    { label: "Moisture",       unit: "%",     color: "#f59e0b", upperLimit: 7.2, lowerLimit: 4.8, domain: [4.0, 8.0] as [number, number] },
  basisWeight: { label: "Basis Weight",  unit: "g/m²",  color: "#10b981", upperLimit: 84,  lowerLimit: 76,  domain: [70, 90] as [number, number] },
};

type TabKey = keyof typeof configs;

export function TrendChart() {
  const [activeTab, setActiveTab] = useState<TabKey>("steam");
  const data = generateTimeSeriesData();
  const currentConfig = configs[activeTab];

  return (
    <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">30-Min Real-time Sensor Trends</h3>
            <Badge variant="outline" className="bg-slate-800/60 text-slate-400 border-slate-700 text-[10px]">Live</Badge>
          </div>

          {/* shadcn Tabs for parameter switching */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
            <TabsList className="bg-slate-950/80 border border-slate-800 h-8">
              {(Object.keys(configs) as TabKey[]).map((tabKey) => (
                <TabsTrigger
                  key={tabKey}
                  value={tabKey}
                  className="text-[11px] font-semibold px-3 py-1 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400"
                >
                  {configs[tabKey].label.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={`grad-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis domain={currentConfig.domain} stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#090d16", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc", fontSize: "12px" }}
                formatter={(val: any) => [`${val} ${currentConfig.unit}`, currentConfig.label]}
              />
              <ReferenceLine y={currentConfig.upperLimit} stroke="#ef4444" strokeDasharray="4 4"
                label={{ value: "Upper", fill: "#ef4444", fontSize: 10, position: "top" }} />
              {currentConfig.lowerLimit && (
                <ReferenceLine y={currentConfig.lowerLimit} stroke="#f59e0b" strokeDasharray="4 4"
                  label={{ value: "Lower", fill: "#f59e0b", fontSize: 10, position: "bottom" }} />
              )}
              <Area type="monotone" dataKey={activeTab} stroke={currentConfig.color}
                strokeWidth={2.5} fillOpacity={1} fill={`url(#grad-${activeTab})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
