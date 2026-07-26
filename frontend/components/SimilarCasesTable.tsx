"use client";

import React from "react";
import { History, CheckCircle2, XCircle, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface CaseItem {
  transition_id?: number | string;
  similarity_pct?: number;
  outcome?: string;
  operator_action?: string;
}

interface SimilarCasesTableProps {
  cases?: CaseItem[];
}

export function SimilarCasesTable({ cases }: SimilarCasesTableProps) {
  const defaultCases: CaseItem[] = [
    { transition_id: 233, similarity_pct: 98.2, outcome: "Success", operator_action: "Reduce Steam Pressure by 0.2 bar" },
    { transition_id: 456, similarity_pct: 96.5, outcome: "Failed", operator_action: "Maintain Machine Speed" },
    { transition_id: 777, similarity_pct: 95.1, outcome: "Success", operator_action: "Increase Stock Flow by 10 L/min" },
    { transition_id: 890, similarity_pct: 93.8, outcome: "Success", operator_action: "Reduce Speed by 5%" },
    { transition_id: 112, similarity_pct: 91.4, outcome: "Success", operator_action: "Adjust Filler Dosing" },
  ];

  const caseList = cases && cases.length > 0 ? cases : defaultCases;
  const successCount = caseList.filter((c) => (c.outcome || "").toLowerCase() === "success").length;
  const totalCount = caseList.length;
  const successRate = totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 80;

  return (
    <Card className="bg-slate-900/80 backdrop-blur-md border-slate-800 shadow-xl">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Top Similar Historical Grade Transitions (Phase 4)
            </h3>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Outcome:</span>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {successRate}% ({successCount}/{totalCount})
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] gap-1">
              <XCircle className="w-3 h-3" />
              {100 - successRate}% Failed
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-950/80 hover:bg-slate-950/80 border-slate-800">
                <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Transition ID</TableHead>
                <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Similarity</TableHead>
                <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Historical Outcome</TableHead>
                <TableHead className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Operator Action Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caseList.map((item, idx) => {
                const isSuccess = (item.outcome || "").toLowerCase() === "success";
                return (
                  <TableRow key={idx} className="border-slate-800/50 hover:bg-slate-800/40 transition-colors">
                    <TableCell className="font-mono font-semibold text-white text-xs">
                      <span className="flex items-center gap-1.5">
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                        #{item.transition_id ?? idx + 100}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-2">
                        <Progress value={item.similarity_pct ?? 90} className="w-16 h-1.5 bg-slate-800" />
                        <span className="font-bold text-slate-200">{item.similarity_pct?.toFixed(1)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isSuccess ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold gap-1">
                          <CheckCircle2 className="w-3 h-3" /> SUCCESS
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] font-bold gap-1">
                          <XCircle className="w-3 h-3" /> OFF SPEC
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-slate-300 text-xs">
                      {item.operator_action || "Adjust Steam & Speed"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
