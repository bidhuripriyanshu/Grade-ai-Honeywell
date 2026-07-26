"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, History, Lightbulb, BarChart3, MessageSquare, Cpu, ShieldCheck, Award, Menu } from "lucide-react";
import { NotificationToast } from "@/components/NotificationToast";
import { LiveTestDrawer } from "@/components/LiveTestDrawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "History", href: "/history", icon: History },
  { name: "Recommendations", href: "/recommendation", icon: Lightbulb },
  { name: "Explainability", href: "/explainability", icon: BarChart3 },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
];

interface NavbarProps {
  onTestDataApplied?: (data: any) => void;
}

export function Navbar({ onTestDataApplied }: NavbarProps) {
  const pathname = usePathname();

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-[#E31837] to-red-700 text-white shadow-md shadow-red-600/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/60 px-6 py-3">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#E31837] to-red-800 flex items-center justify-center shadow-lg shadow-red-600/30 glow-red-sm animate-float">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-tight leading-none">HONEYWELL</span>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-black px-2 py-0.5">
                PAPER AI
              </Badge>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Grade Change Operator Copilot</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800/50">
          <NavLinks />
        </nav>

        {/* Right badges & Live Tester Button */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Live API Tester Button */}
          <LiveTestDrawer onTestDataApplied={onTestDataApplied} />

          <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 glow-cyan font-black text-[11px]">
            <Award className="w-3.5 h-3.5" />
            AI Accuracy: 91%
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden sm:inline">LangGraph Active</span>
          </Badge>

          <NotificationToast />

          {/* Mobile Nav — Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950 border-slate-800 w-64">
              <SheetHeader>
                <SheetTitle className="text-white font-black flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-400" /> Navigation
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4 bg-slate-800" />
              <nav className="flex flex-col gap-1">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
