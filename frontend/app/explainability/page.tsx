"use client";

import { useEffect, useState } from "react";
import { ShapChart } from "@/components/ShapChart";
import { BarChart3, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExplainabilityPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/agent?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-extrabold text-white tracking-tight">EXPLAINABLE AI WITH SHAP (PHASE 6)</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              SHapley Additive exPlanations quantify exact feature contributions for XGBoost off-spec predictions.
            </p>
          </div>
          <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-bold gap-1.5 px-3.5 py-2 text-xs h-auto">
            <Activity className="w-4 h-4" />
            TreeExplainer Log-Odds Engine
          </Badge>
        </CardContent>
      </Card>

      {/* SHAP Component */}
      {loading ? (
        <Skeleton className="h-80 w-full rounded-2xl bg-slate-900" />
      ) : (
        <ShapChart explanation={{ feature_importance: data?.shap }} />
      )}
    </div>
  );
}
