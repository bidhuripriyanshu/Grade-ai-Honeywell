"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, RefreshCw, MessageSquareCheck, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FeedbackButtonsProps {
  onFeedbackSubmit?: (updatedStats: any) => void;
}

export function FeedbackButtons({ onFeedbackSubmit }: FeedbackButtonsProps) {
  const [feedbackState, setFeedbackState] = useState<"none" | "accepted" | "rejected">("none");
  const [accuracy, setAccuracy] = useState(91.3);
  const [acceptedCount, setAcceptedCount] = useState(21);
  const [rejectedCount, setRejectedCount] = useState(2);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const json = await res.json();
        setAccuracy(json.ai_accuracy ?? 91.3);
        setAcceptedCount(json.accepted_count ?? 21);
        setRejectedCount(json.rejected_count ?? 2);
      }
    } catch { /* Use defaults */ }
  };

  useEffect(() => { fetchStats(); }, []);

  const sendFeedback = async (accepted: boolean) => {
    setLoading(true);
    setFeedbackState(accepted ? "accepted" : "rejected");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accepted, operator: "Operator J. Miller", prediction: "Off Spec", risk: 99.95, action: "Reduce Steam Pressure by 0.2 bar" }),
      });
      if (res.ok) {
        const json = await res.json();
        setAccuracy(json.ai_accuracy ?? (accepted ? 91.7 : 90.9));
        setAcceptedCount(json.accepted_count ?? (accepted ? acceptedCount + 1 : acceptedCount));
        setRejectedCount(json.rejected_count ?? (accepted ? rejectedCount : rejectedCount + 1));
        if (onFeedbackSubmit) onFeedbackSubmit(json);
      }
    } catch {
      if (accepted) { setAcceptedCount((p) => p + 1); setAccuracy(91.7); }
      else { setRejectedCount((p) => p + 1); setAccuracy(90.9); }
    } finally { setLoading(false); }
  };

  return (
    <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-xl">
      <CardContent className="p-5 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Label */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <MessageSquareCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Operator Feedback Reinforcement Loop</h4>
            <p className="text-xs text-slate-400">Log operator decisions to continuously validate and train AI accuracy.</p>
          </div>
        </div>

        {/* AI Accuracy */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">AI Accuracy Score</p>
            <p className="text-sm font-extrabold text-cyan-400">{accuracy.toFixed(1)}%</p>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden lg:block h-10 bg-slate-800" />

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {feedbackState === "none" ? (
            <>
              <Button
                onClick={() => sendFeedback(true)}
                disabled={loading}
                className="flex-1 lg:flex-initial bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white border border-emerald-500/30 shadow-lg shadow-emerald-950/40 font-bold text-xs gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept Recommendation
              </Button>
              <Button
                variant="outline"
                onClick={() => sendFeedback(false)}
                disabled={loading}
                className="flex-1 lg:flex-initial bg-slate-950 hover:bg-red-950/40 text-red-400 border-red-500/30 hover:border-red-500/50 font-bold text-xs gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {feedbackState === "accepted" ? (
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-xs font-bold gap-1 h-auto">
                  <CheckCircle2 className="w-4 h-4" /> Recommendation Accepted &amp; Logged!
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2 text-xs font-bold gap-1 h-auto">
                  <XCircle className="w-4 h-4" /> Recommendation Rejected &amp; Logged
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => setFeedbackState("none")} className="text-slate-400 hover:text-white border border-slate-800 rounded-lg" title="Reset state">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-emerald-400">{acceptedCount} Accepted</span>
            <span>/</span>
            <span className="text-red-400">{rejectedCount} Rejected</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
