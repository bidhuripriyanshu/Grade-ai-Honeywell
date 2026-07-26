"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FlaskConical,
  Play,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ChevronRight,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
} from "lucide-react";

interface LiveTestDrawerProps {
  onTestDataApplied?: (data: any) => void;
}

const PRESET_SCENARIOS = [
  {
    name: "🚨 Critical Off-Spec Risk",
    desc: "High steam + excessive machine speed causing severe moisture drop",
    badge: "High Risk",
    color: "red",
    payload: {
      steam_pressure: 10.4,
      machine_speed: 970,
      stock_flow: 102,
      moisture: 4.2,
      ash: 14.5,
      basis_weight: 79.0,
      recipe: "Recipe A",
      grade: "Standard",
    },
  },
  {
    name: "✅ Optimal Normal Operation",
    desc: "Ideal process parameters within target tolerance windows",
    badge: "Safe / Normal",
    color: "emerald",
    payload: {
      steam_pressure: 8.3,
      machine_speed: 880,
      stock_flow: 108,
      moisture: 5.6,
      ash: 12.0,
      basis_weight: 80.2,
      recipe: "Recipe A",
      grade: "Standard",
    },
  },
  {
    name: "⚠️ Thermal Over-Drying",
    desc: "Steam pressure exceeding upper threshold of 9.0 bar",
    badge: "Steam Alert",
    color: "amber",
    payload: {
      steam_pressure: 11.2,
      machine_speed: 910,
      stock_flow: 100,
      moisture: 4.5,
      ash: 11.5,
      basis_weight: 81.0,
      recipe: "Recipe B",
      grade: "Premium",
    },
  },
  {
    name: "🌀 High Speed Instability",
    desc: "Machine speed at 985 RPM causing formation turbulence",
    badge: "Speed Alert",
    color: "cyan",
    payload: {
      steam_pressure: 8.8,
      machine_speed: 985,
      stock_flow: 115,
      moisture: 5.1,
      ash: 13.0,
      basis_weight: 82.5,
      recipe: "Recipe C",
      grade: "Recycled",
    },
  },
];

export function LiveTestDrawer({ onTestDataApplied }: LiveTestDrawerProps) {
  const [open, setOpen] = useState(false);
  const [params, setParams] = useState({
    steam_pressure: 9.8,
    machine_speed: 950,
    stock_flow: 105,
    moisture: 4.7,
    ash: 12.0,
    basis_weight: 80.0,
    recipe: "Recipe A",
    grade: "Standard",
  });

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const handleInputChange = (field: string, val: any) => {
    setParams((prev) => ({ ...prev, [field]: val }));
  };

  const loadPreset = (scenario: typeof PRESET_SCENARIOS[0]) => {
    setParams(scenario.payload);
  };

  const runLiveTest = async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      if (res.ok) {
        const json = await res.json();
        setTestResult(json);
      }
    } catch (err) {
      console.error("Test execution error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyToDashboard = () => {
    if (testResult && onTestDataApplied) {
      onTestDataApplied(testResult);
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-red-600/20 via-slate-900 to-cyan-500/20 hover:from-red-600/30 hover:to-cyan-500/30 text-white border-cyan-500/40 hover:border-cyan-400 font-extrabold text-xs shadow-lg glow-cyan gap-2 rounded-xl"
        >
          <FlaskConical className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Live API Tester</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="bg-slate-950/95 backdrop-blur-2xl border-slate-800 text-slate-100 w-[520px] max-w-[95vw] p-0 flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-red-600 flex items-center justify-center text-white shadow-lg glow-cyan">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-black text-white tracking-tight flex items-center gap-2">
                  LIVE API COMBINATION TESTER
                </SheetTitle>
                <p className="text-[11px] text-slate-400 font-medium">
                  Test custom machine sensor inputs against LangGraph &amp; XGBoost
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-[10px] font-mono">
              POST /api/agent
            </Badge>
          </div>
        </SheetHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Tabs defaultValue="presets" className="w-full">
            <TabsList className="bg-slate-900 border border-slate-800 w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="presets" className="text-xs font-bold data-[state=active]:bg-slate-800 text-slate-300">
                1-Click Test Presets
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-xs font-bold data-[state=active]:bg-slate-800 text-slate-300">
                Custom Parameters
              </TabsTrigger>
            </TabsList>

            {/* Presets Tab */}
            <TabsContent value="presets" className="space-y-3 mt-0">
              <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Select a process scenario combination:
              </p>
              <div className="grid grid-cols-1 gap-2.5">
                {PRESET_SCENARIOS.map((sc, idx) => (
                  <Card
                    key={idx}
                    onClick={() => loadPreset(sc)}
                    className="bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer group"
                  >
                    <CardContent className="p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-white group-hover:text-cyan-400 transition-colors">
                            {sc.name}
                          </h4>
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold ${
                              sc.color === "red"
                                ? "bg-red-500/10 text-red-400 border-red-500/20"
                                : sc.color === "emerald"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : sc.color === "amber"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                            }`}
                          >
                            {sc.badge}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{sc.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Custom Sliders Tab */}
            <TabsContent value="custom" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-3">
                {/* Steam Pressure */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">Steam Pressure</span>
                    <span className="font-mono text-cyan-400 font-black">{params.steam_pressure} bar</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="12.0"
                    step="0.1"
                    value={params.steam_pressure}
                    onChange={(e) => handleInputChange("steam_pressure", parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>6.0 bar</span>
                    <span>Target: 8.0–9.0</span>
                    <span>12.0 bar</span>
                  </div>
                </div>

                {/* Machine Speed */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">Machine Speed</span>
                    <span className="font-mono text-cyan-400 font-black">{params.machine_speed} RPM</span>
                  </div>
                  <input
                    type="range"
                    min="700"
                    max="1000"
                    step="5"
                    value={params.machine_speed}
                    onChange={(e) => handleInputChange("machine_speed", parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>700</span>
                    <span>Target: 800–940</span>
                    <span>1000</span>
                  </div>
                </div>

                {/* Moisture */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">Moisture</span>
                    <span className="font-mono text-cyan-400 font-black">{params.moisture}%</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="9.0"
                    step="0.1"
                    value={params.moisture}
                    onChange={(e) => handleInputChange("moisture", parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>3.0%</span>
                    <span>Target: 4.8–7.2</span>
                    <span>9.0%</span>
                  </div>
                </div>

                {/* Stock Flow */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">Stock Flow</span>
                    <span className="font-mono text-cyan-400 font-black">{params.stock_flow} L/m</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="130"
                    step="1"
                    value={params.stock_flow}
                    onChange={(e) => handleInputChange("stock_flow", parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                    <span>80 L/m</span>
                    <span>Target: 95–120</span>
                    <span>130 L/m</span>
                  </div>
                </div>

                {/* Ash */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">Ash Content</span>
                    <span className="font-mono text-cyan-400 font-black">{params.ash}%</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="20.0"
                    step="0.5"
                    value={params.ash}
                    onChange={(e) => handleInputChange("ash", parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Basis Weight */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-300">Basis Weight</span>
                    <span className="font-mono text-cyan-400 font-black">{params.basis_weight} g/m²</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    step="1"
                    value={params.basis_weight}
                    onChange={(e) => handleInputChange("basis_weight", parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Recipe Select */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Target Recipe</label>
                  <select
                    value={params.recipe}
                    onChange={(e) => handleInputChange("recipe", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2 focus:border-cyan-400"
                  >
                    <option value="Recipe A">Recipe A (Standard Paper)</option>
                    <option value="Recipe B">Recipe B (High Duty Paper)</option>
                    <option value="Recipe C">Recipe C (Recycled Stock)</option>
                  </select>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <label className="text-xs font-bold text-slate-300 block mb-1">Paper Grade</label>
                  <select
                    value={params.grade}
                    onChange={(e) => handleInputChange("grade", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-lg p-2 focus:border-cyan-400"
                  >
                    <option value="Standard">Standard Grade</option>
                    <option value="Premium">Premium Kraft</option>
                    <option value="Industrial">Industrial Liner</option>
                  </select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Execution Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={runLiveTest}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg glow-cyan gap-2 py-3 rounded-xl"
            >
              <Play className={`w-4 h-4 fill-current ${loading ? "animate-spin" : ""}`} />
              {loading ? "Evaluating in LangGraph..." : "Run Live API Test"}
            </Button>
          </div>

          {/* Live Test Results Output */}
          {testResult && (
            <Card className="bg-slate-900/90 border-slate-800 shadow-2xl animate-fade-in-up">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white">API Response</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                      200 OK
                    </Badge>
                  </div>
                  {latency && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      ⚡ {latency} ms
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Off-Spec Risk</p>
                    <p className={`text-base font-black ${testResult.risk >= 70 ? "text-red-400" : "text-emerald-400"}`}>
                      {testResult.risk?.toFixed(1)}%
                    </p>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Prediction</p>
                    <p className="text-base font-black text-white">{testResult.prediction}</p>
                  </div>
                </div>

                {/* Top SHAP Driver */}
                {testResult.shap && testResult.shap.length > 0 && (
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Top SHAP Risk Driver</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{testResult.shap[0].feature}</span>
                      <span className={`font-mono font-bold ${testResult.shap[0].impact >= 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {testResult.shap[0].impact >= 0 ? "+" : ""}{testResult.shap[0].impact}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Recommendations Summary */}
                {testResult.recommendations?.summary && (
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-relaxed italic">
                    &ldquo;{testResult.recommendations.summary}&rdquo;
                  </div>
                )}

                {/* Apply Button */}
                {onTestDataApplied && (
                  <Button
                    onClick={applyToDashboard}
                    className="w-full bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 font-bold text-xs gap-2 py-2 rounded-xl mt-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Apply This Test Result to Dashboard UI
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
