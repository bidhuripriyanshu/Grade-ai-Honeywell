"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Brain,
  Zap,
  CheckCircle2,
  TrendingUp,
  Activity,
  Sliders,
  Sparkles,
  ArrowRight,
  Play,
  Search,
  Shield,
  Layers,
  BarChart3,
  Cpu,
  Flame,
  Gauge,
  Droplets,
  HelpCircle,
  ChevronRight,
  Building2,
  Lock,
  Globe,
  Code2,
  Clock,
  Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Statistics Data ──
const STATS = [
  { value: "50,000+", label: "Historical Transitions", icon: Layers, color: "text-[#4F9CF9]" },
  { value: "92%", label: "Prediction Accuracy", icon: Award, color: "text-emerald-400" },
  { value: "5 sec", label: "AI Analysis Time", icon: Zap, color: "text-amber-400" },
  { value: "24/7", label: "Real-Time Monitoring", icon: Activity, color: "text-[#E2231A]" },
];

// ── Features Data ──
const FEATURES = [
  {
    title: "Predict Off-Spec Risk",
    desc: "Machine learning XGBoost models evaluate real-time sensor parameters to predict paper web defects and off-spec risks before they occur.",
    icon: Activity,
    badge: "ML Anomaly Engine",
    color: "from-[#E2231A]/20 to-red-600/10",
    borderColor: "border-[#E2231A]/30",
    iconColor: "text-[#E2231A]",
  },
  {
    title: "Historical Transition Search",
    desc: "Instantly query thousands of past grade change trajectories using high-dimensional vector similarity matching to find winning recovery recipes.",
    icon: Search,
    badge: "Vector Similarity DB",
    color: "from-blue-600/20 to-cyan-500/10",
    borderColor: "border-[#4F9CF9]/30",
    iconColor: "text-[#4F9CF9]",
  },
  {
    title: "AI Recommendations",
    desc: "Receive precise, automated corrective setpoints — such as reducing steam pressure by 0.2 bar, adjusting machine speed, or raising stock flow.",
    icon: Sparkles,
    badge: "Decision Engine",
    color: "from-amber-500/20 to-yellow-500/10",
    borderColor: "border-amber-500/30",
    iconColor: "text-amber-400",
  },
  {
    title: "Explainable AI",
    desc: "Understand the exact root causes behind every risk score using SHAP feature importance charts coupled with Groq LLM process engineering narratives.",
    icon: BarChart3,
    badge: "SHAP + Groq LLM",
    color: "from-emerald-500/20 to-teal-500/10",
    borderColor: "border-emerald-500/30",
    iconColor: "text-emerald-400",
  },
];

// ── Workflow Steps ──
const WORKFLOW_STEPS = [
  { step: "01", name: "Sensor Data", desc: "Streams DCS telemetry (steam, speed, moisture, basis weight).", icon: Cpu },
  { step: "02", name: "AI Prediction", desc: "XGBoost predicts off-spec defect risk probability.", icon: Activity },
  { step: "03", name: "Historical Search", desc: "Vector DB retrieves top matched historical transition.", icon: Search },
  { step: "04", name: "Recommendations", desc: "Rules engine computes optimal corrective setpoints.", icon: Sliders },
  { step: "05", name: "Explainable AI", desc: "Groq LLM synthesizes natural engineering explanation.", icon: Sparkles },
  { step: "06", name: "Operator Decision", desc: "Operator reviews and auto-applies approved changes.", icon: CheckCircle2 },
];

// ── Testimonials ──
const TESTIMONIALS = [
  {
    quote: "Reduced transition losses by 18%. The real-time SHAP analysis gives our operators immediate confidence during complex grade changes.",
    author: "VP of Manufacturing Operations",
    company: "Global Paper & Packaging Co.",
    metric: "18% Loss Reduction",
  },
  {
    quote: "Operators now trust AI recommendations completely. The natural language LLM explanation translates raw sensor anomalies into practical shop-floor steps.",
    author: "Lead DCS Process Engineer",
    company: "Honeywell Industrial Mill",
    metric: "92% Recommendation Trust Rate",
  },
  {
    quote: "Improved production consistency across all shifts. We've virtually eliminated web breaks and moisture defects during Grade 60 to 80 g/m² transitions.",
    author: "Plant Operations Manager",
    company: "North American Packaging Mill",
    metric: "Zero Web Break Incidents",
  },
];

export default function PaperPilotLandingPage() {
  const [promptText, setPromptText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  const handleChipClick = (chipText: string) => {
    if (!promptText.includes(chipText)) {
      setPromptText((prev) => (prev ? `${prev}, ${chipText}` : chipText));
    }
  };

  const handleAnalyzeClick = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#081120] text-slate-100 overflow-hidden relative selection:bg-[#E2231A]/80 selection:text-white">
      
      {/* ── Background Glow & Particle Grids ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#E2231A]/10 via-[#4F9CF9]/10 to-transparent blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-[#4F9CF9]/5 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute inset-0 industrial-grid opacity-30 pointer-events-none -z-10" />

      {/* ── Demo Video Modal ── */}
      <Dialog open={demoModalOpen} onOpenChange={setDemoModalOpen}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Play className="w-4 h-4 text-[#E2231A]" /> PaperPilot AI — Product Demonstration
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#E2231A]/10 via-slate-950 to-cyan-500/10 pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-[#E2231A] flex items-center justify-center shadow-xl glow-red cursor-pointer group-hover:scale-110 transition-transform mb-4">
              <Play className="w-8 h-8 text-white fill-current ml-1" />
            </div>
            <h3 className="text-lg font-black text-white">Interactive Grade Change Simulation</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Watch how LangGraph orchestrates XGBoost risk prediction, vector similarity lookup, and Groq LLM process engineering narratives in under 5 seconds.
            </p>
            <Button
              onClick={() => {
                setDemoModalOpen(false);
                window.location.href = "/dashboard";
              }}
              className="mt-5 bg-gradient-to-r from-[#E2231A] to-red-600 text-white font-extrabold text-xs px-5 py-2 rounded-xl"
            >
              Launch Live Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── HERO SECTION ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Honeywell Enterprise Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#E2231A]/15 via-slate-900 to-[#4F9CF9]/15 border border-[#E2231A]/30 glow-red-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E2231A] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E2231A]" />
              </span>
              <span className="text-xs font-black tracking-wide text-slate-200">
                HONEYWELL ENTERPRISE AI COPILOT
              </span>
              <Badge variant="outline" className="bg-[#4F9CF9]/20 text-[#4F9CF9] border-[#4F9CF9]/30 text-[10px] font-extrabold py-0">
                v2.4 Live
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]"
            >
              AI Copilot for Intelligent Paper{" "}
              <span className="bg-gradient-to-r from-[#E2231A] via-red-500 to-[#4F9CF9] bg-clip-text text-transparent">
                Grade Change Optimization
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl"
            >
              Predict off-spec production before it happens. Analyze historical transitions, receive AI recommendations, and understand every decision with explainable AI.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#E2231A] via-red-600 to-[#4F9CF9] hover:from-red-600 hover:to-blue-600 text-white font-extrabold text-sm px-7 py-3.5 rounded-xl shadow-2xl glow-red hover:scale-105 transition-all gap-2 group"
                >
                  <span>🚀 Try the Model</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setDemoModalOpen(true)}
                className="bg-slate-950/80 hover:bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500 font-bold text-sm px-6 py-3.5 rounded-xl gap-2 transition-all"
              >
                <Play className="w-4 h-4 text-[#4F9CF9] fill-current" />
                <span>▶ Watch Demo</span>
              </Button>
            </motion.div>

            {/* Key Assurance Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center gap-6 pt-4 text-xs text-slate-400 font-medium flex-wrap"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>LangGraph Orchestrated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4F9CF9]" />
                <span>SHAP Explainable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#E2231A]" />
                <span>Honeywell DCS Ready</span>
              </div>
            </motion.div>

          </div>

          {/* Right Side 3D Dashboard Mockup Card */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative rounded-3xl p-6 glass border border-slate-800/80 shadow-2xl overflow-hidden group hover:border-[#4F9CF9]/40 transition-all duration-500"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#E2231A] animate-ping" />
                  <span className="text-xs font-black text-white tracking-widest uppercase">
                    LIVE DCS MONITORING
                  </span>
                </div>
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-extrabold animate-pulse">
                  OFF-SPEC ALERT
                </Badge>
              </div>

              {/* Mockup Body Content */}
              <div className="pt-5 space-y-5">
                
                {/* Risk Gauge Block */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-red-950/40 via-slate-950 to-slate-950 border border-red-500/30 flex items-center justify-between gap-4 relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">PREDICTED OFF-SPEC RISK</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-red-400 font-mono">92%</span>
                      <span className="text-xs font-bold text-red-500 uppercase">HIGH RISK</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Recipe A → B Transition Anomaly</p>
                  </div>
                  
                  {/* Gauge Arc Illustration */}
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="text-[#E2231A]" strokeDasharray="92, 100" strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span className="absolute text-xs font-mono font-bold text-white">92%</span>
                  </div>
                </div>

                {/* Sensor Parameters Chips */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Flame className="w-3 h-3 text-red-400" /> Steam
                    </div>
                    <span className="text-xs font-bold font-mono text-white mt-1 block">9.8 bar</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Gauge className="w-3 h-3 text-[#4F9CF9]" /> Speed
                    </div>
                    <span className="text-xs font-bold font-mono text-white mt-1 block">950 RPM</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Droplets className="w-3 h-3 text-cyan-400" /> Moisture
                    </div>
                    <span className="text-xs font-bold font-mono text-amber-400 mt-1 block">4.7%</span>
                  </div>
                </div>

                {/* AI Recommendation Box */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-cyan-300">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    <span>AI Recommendation Setpoint</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Reduce Steam Pressure by <strong className="text-cyan-300">0.2 bar</strong> &amp; lower Machine Speed by <strong className="text-cyan-300">5%</strong> to re-establish moisture equilibrium.
                  </p>
                </div>

                {/* SHAP Feature Contribution Bars */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400">SHAP Risk Drivers</span>
                    <span className="font-mono text-red-400">+92% Total Risk</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span>Moisture (4.7%)</span>
                      <span className="font-mono text-red-400">+72.8%</span>
                    </div>
                    <Progress value={73} className="h-1.5 bg-slate-900 border border-slate-800" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-300">
                      <span>Steam Pressure (9.8 bar)</span>
                      <span className="font-mono text-amber-400">+40.0%</span>
                    </div>
                    <Progress value={40} className="h-1.5 bg-slate-900 border border-slate-800" />
                  </div>
                </div>

              </div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* ── STATISTICS SECTION ── */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all text-center flex flex-col items-center group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${stat.color}`}>
                    {stat.value}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <Badge variant="outline" className="bg-[#4F9CF9]/10 text-[#4F9CF9] border-[#4F9CF9]/30 text-xs font-extrabold">
            ENTERPRISE INDUSTRIAL AI
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Next-Generation Grade Change Capabilities
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Engineered specifically for continuous pulp &amp; paper manufacturing, bringing real-time precision to DCS operator workflow gates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`glass p-6 rounded-2xl border ${feat.borderColor} bg-gradient-to-b ${feat.color} flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center ${feat.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className="bg-slate-900/80 text-slate-300 border-slate-700 text-[10px] font-mono">
                      {feat.badge}
                    </Badge>
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800/60 mt-6 flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                  <span>Learn more</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="border-t border-slate-800/80 bg-slate-950/40 py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="bg-[#E2231A]/10 text-red-400 border-[#E2231A]/30 text-xs font-extrabold">
              AUTONOMOUS 6-STAGE WORKFLOW
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              How PaperPilot AI Orchestrates Transitions
            </h2>
            <p className="text-sm text-slate-400">
              LangGraph DAG orchestrates 6 intelligent steps in under 5 seconds, combining prediction, vector search, rule engine, and LLM reasoning.
            </p>
          </div>

          {/* Workflow Step Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 relative">
            {WORKFLOW_STEPS.map((wf, idx) => {
              const Icon = wf.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="glass p-5 rounded-2xl border border-slate-800/80 hover:border-[#4F9CF9]/50 transition-all flex flex-col justify-between group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono text-[#E2231A] bg-red-950/60 px-2 py-0.5 rounded-md border border-red-900/50">
                        {wf.step}
                      </span>
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <h3 className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                      {wf.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {wf.desc}
                    </p>
                  </div>

                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-700">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE AI DEMO SECTION ── */}
      <section id="ai-copilot" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="glass rounded-3xl border border-slate-800/80 p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#4F9CF9]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-xs font-black uppercase text-cyan-300 tracking-wider">INTERACTIVE AI DEMO</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Test PaperPilot AI Copilot Live
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Describe your current machine state or select example sensor setpoints below to test instant AI anomaly detection &amp; LLM reasoning.
            </p>

            {/* Prompt Input Box */}
            <div className="space-y-3 pt-2">
              <div className="relative">
                <textarea
                  rows={3}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Describe your machine state or paste sensor readings (e.g. Steam Pressure 9.8 bar, Speed 950 RPM)..."
                  className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#4F9CF9] transition-all resize-none font-mono"
                />
                <Button
                  onClick={handleAnalyzeClick}
                  disabled={isAnalyzing}
                  className="absolute bottom-3 right-3 bg-gradient-to-r from-[#E2231A] to-[#4F9CF9] text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-lg glow-red"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" /> Evaluating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      Analyze with AI <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </Button>
              </div>

              {/* Example Prompt Chips */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400 font-mono text-[11px]">Example Prompts:</span>
                {[
                  "Grade A → Grade B",
                  "Steam Pressure 8.7 bar",
                  "Speed 1500 m/min",
                  "High Moisture 4.2%"
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-[#4F9CF9] text-[11px] font-mono transition-all"
                  >
                    + {chip}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="border-t border-slate-800/80 bg-slate-950/40 py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-extrabold">
              ENTERPRISE TRUST &amp; IMPACT
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Proven Results Across Global Paper Mills
            </h2>
            <p className="text-sm text-slate-400">
              See how PaperPilot AI empowers mill superintendents, process engineers, and DCS operators every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
              >
                <div className="space-y-3">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-mono">
                    {t.metric}
                  </Badge>
                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800/60">
                  <p className="text-xs font-extrabold text-white">{t.author}</p>
                  <p className="text-[11px] text-slate-400">{t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION SECTION ── */}
      <section id="cta" className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="rounded-3xl bg-gradient-to-r from-[#E2231A]/20 via-slate-950 to-[#4F9CF9]/20 border border-[#E2231A]/40 p-10 sm:p-16 text-center space-y-6 relative overflow-hidden shadow-2xl glow-red-sm">
          <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />

          <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs font-black">
            DEPLOY IN UNDER 5 MINUTES
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Ready to optimize every grade change?
          </h2>

          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Eliminate off-spec defects, reduce grade transition duration, and provide real-time AI copilot guidance to your operators.
          </p>

          <div className="pt-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#E2231A] via-red-600 to-[#4F9CF9] hover:from-red-600 hover:to-blue-600 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-2xl glow-red hover:scale-105 transition-all gap-2"
              >
                <span>🚀 Try the Model</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER SECTION ── */}
      <footer id="footer" className="border-t border-slate-800/80 bg-slate-950/90 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Logo & Tagline */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E2231A] to-blue-600 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-base text-white">PaperPilot AI</span>
                <p className="text-[10px] text-slate-400">Honeywell Grade Change Copilot</p>
              </div>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-400 flex-wrap">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">Documentation</a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" /> GitHub
              </a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#footer" className="hover:text-white transition-colors">Contact</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> LinkedIn
              </a>
              <Link href="/dashboard" className="text-[#4F9CF9] hover:underline font-bold">
                Dashboard →
              </Link>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500 font-mono flex-wrap gap-2">
            <span>© 2026 PaperPilot AI. All rights reserved. Honeywell Process Solutions Partner.</span>
            <span>v2.4 Enterprise Edition</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
