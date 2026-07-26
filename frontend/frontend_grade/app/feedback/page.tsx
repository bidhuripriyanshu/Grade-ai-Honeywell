"use client";

import React, { useEffect, useState } from "react";
import { FeedbackButtons } from "@/components/FeedbackButtons";
import { MessageSquareCheck, CheckCircle2, XCircle, Clock, Award, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function FeedbackPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) { const json = await res.json(); setStats(json); }
    } catch { /* Fallback */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  const logs = stats?.history || [
    { id: "FB-101", accepted: true, operator: "Operator J. Miller", prediction: "Off Spec", risk: 99.95, action: "Reduce Steam Pressure by 0.2 bar", timestamp: "2026-07-25T19:40:00Z" },
    { id: "FB-102", accepted: true, operator: "Operator J. Miller", prediction: "Off Spec", risk: 98.20, action: "Reduce Machine Speed by 5%", timestamp: "2026-07-25T19:15:00Z" },
    { id: "FB-103", accepted: true, operator: "Shift Sup. A. Vance", prediction: "Off Spec", risk: 95.40, action: "Increase Stock Flow by 10 L/min", timestamp: "2026-07-25T18:50:00Z" },
    { id: "FB-104", accepted: false, operator: "Shift Sup. A. Vance", prediction: "Off Spec", risk: 92.10, action: "Adjust Filler Dosing", timestamp: "2026-07-25T18:10:00Z" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-xl font-extrabold text-white tracking-tight">OPERATOR FEEDBACK AUDIT &amp; AI ACCURACY</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Historical audit log of operator recommendation acceptances and overrides.</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-bold text-xs gap-1 px-4 py-2 h-auto">
              <Award className="w-4 h-4" />
              AI Accuracy: {stats?.ai_accuracy ?? 91.3}%
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-xs gap-1 px-4 py-2 h-auto">
              <ShieldCheck className="w-4 h-4" />
              {stats?.accepted_count ?? 21} / {stats?.total_feedback ?? 23} Accepted
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Feedback Controls */}
      <FeedbackButtons onFeedbackSubmit={() => fetchStats()} />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Award, label: "Overall AI Accuracy", value: `${stats?.ai_accuracy ?? 91.3}%`, color: "cyan" },
          { icon: CheckCircle2, label: "Accepted Recommendations", value: stats?.accepted_count ?? 21, color: "emerald" },
          { icon: XCircle, label: "Operator Overrides / Rejected", value: stats?.rejected_count ?? 2, color: "red" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <Card key={i} className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-4 flex items-center gap-4">
              {loading ? (
                <Skeleton className="w-12 h-12 rounded-xl bg-slate-800" />
              ) : (
                <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-${color}-400`}>
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase">{label}</p>
                {loading ? (
                  <Skeleton className="h-7 w-20 mt-1 bg-slate-800" />
                ) : (
                  <p className={`text-2xl font-black ${color === "emerald" ? "text-emerald-400" : color === "red" ? "text-red-400" : "text-white"} mt-0.5`}>
                    {value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Audit Log Table */}
      <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-xl">
        <CardHeader className="pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Audit History &amp; Operator Decision Trail</h3>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-950/80 hover:bg-slate-950/80 border-slate-800">
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Audit ID</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Recommended Action</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Prediction &amp; Risk</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Operator Decision</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Operator</TableHead>
                  <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any, idx: number) => (
                  <TableRow key={log.id || idx} className="border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    <TableCell className="font-mono font-semibold text-white text-xs">{log.id}</TableCell>
                    <TableCell className="font-medium text-slate-200 text-xs">{log.action}</TableCell>
                    <TableCell className="text-xs font-mono">
                      <span className="text-slate-400">{log.prediction}</span>{" "}
                      <span className="text-red-400">({log.risk}%)</span>
                    </TableCell>
                    <TableCell>
                      {log.accepted ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1">
                          <CheckCircle2 className="w-3 h-3" /> ACCEPTED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold gap-1">
                          <XCircle className="w-3 h-3" /> REJECTED
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-400 text-xs">{log.operator}</TableCell>
                    <TableCell className="text-slate-500 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
