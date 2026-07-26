import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Honeywell Grade Change AI Copilot | Phase 11",
  description:
    "Industrial AI Copilot for paper mill grade transitions. Real-time off-spec risk prediction, SHAP explainability, LangGraph orchestration, and operator feedback loop.",
  keywords: ["Honeywell", "Paper Mill AI", "Grade Change", "XGBoost", "LangGraph", "SHAP", "Industrial AI"],
  openGraph: {
    title: "Honeywell Grade Change AI Copilot",
    description: "Real-time off-spec risk prevention powered by XGBoost, SHAP, LangGraph, and LLM explanations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060913] text-slate-100 min-h-screen antialiased selection:bg-red-500/80 selection:text-white">
        <Navbar />
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}

