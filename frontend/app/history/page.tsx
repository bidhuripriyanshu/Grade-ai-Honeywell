"use client";

import { useEffect, useState } from "react";
import { SimilarCasesTable } from "@/components/SimilarCasesTable";
import { History, Search, Layers, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
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
              <History className="w-5 h-5 text-cyan-400" />
              <h1 className="text-xl font-extrabold text-white tracking-tight">HISTORICAL SIMILARITY SEARCH (PHASE 4)</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Search 50,000+ historical paper mill transitions using vector cosine similarity index.
            </p>
          </div>
          <Badge variant="outline" className="bg-slate-950 border-slate-800 text-slate-300 font-mono text-xs gap-1.5 px-3 py-2 h-auto">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            Index: FAISS / Cosine NN
          </Badge>
        </CardContent>
      </Card>

      {/* Filter Options */}
      <Card className="bg-slate-900/60 border-slate-800">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-cyan-400" />
            <Badge variant="outline" className="bg-slate-800/60 text-slate-200 border-slate-700 font-bold text-xs">
              Active Grade: Standard
            </Badge>
            <Badge variant="outline" className="bg-slate-800/60 text-slate-200 border-slate-700 font-bold text-xs">
              Target Recipe: Recipe A
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Layers className="w-3.5 h-3.5" />
            <span>Top-5 Most Similar Transition Matches</span>
          </div>
        </CardContent>
      </Card>

      {/* Similar Cases Component */}
      {loading ? (
        <Skeleton className="h-80 w-full rounded-2xl bg-slate-900" />
      ) : (
        <SimilarCasesTable cases={data?.similar_cases} />
      )}
    </div>
  );
}
