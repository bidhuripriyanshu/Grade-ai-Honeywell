"use client";

import React, { useState, useCallback } from "react";
import { AlertTriangle, Zap, CheckCircle2, Bell, X, Thermometer, Activity } from "lucide-react";

interface Notification {
  id: number;
  type: "danger" | "warning" | "success" | "info";
  title: string;
  message: string;
  time: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "danger",
    title: "Off-Spec Risk Spike Detected",
    message: "Steam pressure at 9.8 bar — XGBoost predicts 99.9% off-spec probability.",
    time: "Just now",
  },
  {
    id: 2,
    type: "warning",
    title: "Moisture Level Below Threshold",
    message: "Moisture at 4.7% — below the 4.8% lower quality limit. Increase stock flow.",
    time: "2 min ago",
  },
  {
    id: 3,
    type: "success",
    title: "LangGraph Workflow Completed",
    message: "AI agent orchestrated prediction → history → recommendations → SHAP in 1.2s.",
    time: "4 min ago",
  },
  {
    id: 4,
    type: "info",
    title: "Similar Case #233 Matched",
    message: "98.2% similarity with historical successful grade transition.",
    time: "5 min ago",
  },
];

const ICONS = {
  danger:  <AlertTriangle className="w-4 h-4 text-red-400" />,
  warning: <Thermometer className="w-4 h-4 text-amber-400" />,
  success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  info:    <Activity className="w-4 h-4 text-cyan-400" />,
};

const COLORS = {
  danger:  "border-red-500/30 bg-red-950/20",
  warning: "border-amber-500/30 bg-amber-950/20",
  success: "border-emerald-500/30 bg-emerald-950/20",
  info:    "border-cyan-500/30 bg-cyan-950/20",
};

const DOTS = {
  danger:  "bg-red-400",
  warning: "bg-amber-400",
  success: "bg-emerald-400",
  info:    "bg-cyan-400",
};

export function NotificationToast() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  const unreadCount = notifications.filter((n) => !dismissed.has(n.id)).length;

  const dismiss = useCallback((id: number) => {
    setDismissed((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setDismissed((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 350);
  }, []);

  const addAlert = useCallback(() => {
    const newAlert: Notification = {
      id: Date.now(),
      type: "danger",
      title: "⚡ Live Risk Event",
      message: "Machine speed has exceeded 950 RPM. Reduce speed by 5% immediately.",
      time: "Just now",
    };
    setNotifications((prev) => [newAlert, ...prev.slice(0, 4)]);
    setOpen(true);
  }, []);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center gap-2 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-2 rounded-xl transition-all duration-200 group"
        aria-label="Toggle Notifications"
      >
        <Bell className="w-4 h-4 group-hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-scale-pop shadow-lg shadow-red-500/40">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 z-50 animate-fade-in-down">
          <div className="glass-red rounded-2xl shadow-2xl overflow-hidden">
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400 animate-pulse" />
                <span className="text-xs font-black text-white uppercase tracking-wider">Live Alerts</span>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={addAlert}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold border border-cyan-500/30 px-2 py-1 rounded-lg transition-colors"
                >
                  + Simulate
                </button>
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs">No active alerts</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`relative p-3.5 border-b border-slate-800/40 flex items-start gap-3 border-l-2 ${COLORS[n.type]} ${dismissed.has(n.id) ? "animate-slide-out-right" : "animate-slide-in-right"} transition-all`}
                    style={{ borderLeftColor: n.type === "danger" ? "#ef4444" : n.type === "warning" ? "#f59e0b" : n.type === "success" ? "#10b981" : "#06b6d4" }}
                  >
                    <div className="mt-0.5 shrink-0">{ICONS[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-tight">{n.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${DOTS[n.type]}`} />
                        <span className="text-[10px] text-slate-500">{n.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => dismiss(n.id)}
                      className="text-slate-600 hover:text-slate-400 mt-0.5 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
