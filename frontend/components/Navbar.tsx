"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  History, 
  Lightbulb, 
  BarChart3, 
  MessageSquare, 
  Cpu, 
  Award, 
  Menu,
  Sparkles,
  ArrowRight,
  User,
  Shield,
  Layers,
  Zap,
  Home
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const dashboardNavItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: Activity },
  { name: "History", href: "/history", icon: History },
  { name: "Recommendations", href: "/recommendation", icon: Lightbulb },
  { name: "Explainability", href: "/explainability", icon: BarChart3 },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
];

const landingNavItems = [
  { name: "Features", href: "#features" },
  { name: "How It Works", href: "#how-it-works" },
  { name: "AI Copilot", href: "#ai-copilot" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "About", href: "#testimonials" },
  { name: "Contact", href: "#footer" },
];

interface NavbarProps {
  onTestDataApplied?: (data: any) => void;
}

export function Navbar({ onTestDataApplied }: NavbarProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-800/80 px-4 sm:px-6 py-3 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#E2231A] via-red-600 to-blue-600 flex items-center justify-center shadow-lg shadow-red-600/30 glow-red-sm group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">
                PaperPilot AI
              </span>
              <Badge variant="outline" className="bg-[#E2231A]/20 text-red-400 border-[#E2231A]/30 text-[10px] font-black px-2 py-0.5">
                HONEYWELL
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {isLandingPage ? "Industrial AI Grade Copilot" : "Grade Change Operator Copilot"}
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800/80">
          {isLandingPage ? (
            landingNavItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
              >
                {item.name}
              </a>
            ))
          ) : (
            dashboardNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#E2231A] to-red-700 text-white shadow-md shadow-red-600/25"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.name}
                </Link>
              );
            })
          )}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {!isLandingPage && (
            <>
              <LiveTestDrawer onTestDataApplied={onTestDataApplied} />
              <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 bg-cyan-500/10 text-cyan-400 border-cyan-500/20 glow-cyan font-black text-xs">
                <Award className="w-3.5 h-3.5" />
                AI Accuracy: 92%
              </Badge>
              <NotificationToast />
            </>
          )}

          {isLandingPage && (
            <>
              {/* Login Dialog */}
              <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Login</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-950/95 border-slate-800 text-white max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-500" /> Honeywell Enterprise SSO
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-3">
                    <p className="text-xs text-slate-400">
                      Sign in with your Honeywell DCS operator or plant engineer credentials.
                    </p>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-slate-300">Operator ID / Email</label>
                      <input
                        type="email"
                        placeholder="operator@honeywell.com"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        defaultValue="operator.miller@honeywell.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono text-slate-300">DCS Security Pin</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                        defaultValue="12345678"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setLoginOpen(false);
                        window.location.href = "/dashboard";
                      }}
                      className="w-full bg-gradient-to-r from-[#E2231A] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg glow-red-sm"
                    >
                      Authenticate DCS Session
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Try the Model Button */}
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#E2231A] via-red-600 to-blue-600 hover:from-red-600 hover:to-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xl glow-red-sm gap-2 group"
                >
                  <span>🚀 Try the Model</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </>
          )}

          {/* Mobile Sheet Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-slate-950 border-slate-800 w-64 text-white">
              <SheetHeader>
                <SheetTitle className="text-white font-black flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-500" /> PaperPilot AI Navigation
                </SheetTitle>
              </SheetHeader>
              <Separator className="my-4 bg-slate-800" />
              <nav className="flex flex-col gap-2">
                {isLandingPage ? (
                  landingNavItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900"
                    >
                      {item.name}
                    </a>
                  ))
                ) : (
                  dashboardNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-900"
                      >
                        <Icon className="w-4 h-4 text-red-400" />
                        {item.name}
                      </Link>
                    );
                  })
                )}
                <Separator className="my-2 bg-slate-800" />
                <Link href="/dashboard" className="w-full">
                  <Button className="w-full bg-[#E2231A] text-white font-bold text-xs">
                    🚀 Try the Model
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
