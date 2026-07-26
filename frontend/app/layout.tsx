import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PaperPilot AI | Intelligent Paper Grade Change Optimization",
  description:
    "Predict off-spec production before it happens. Analyze historical transitions, receive AI recommendations, and understand every decision with explainable AI.",
  keywords: ["PaperPilot AI", "Honeywell", "Paper Mill AI", "Grade Change", "XGBoost", "LangGraph", "SHAP", "Industrial AI"],
  openGraph: {
    title: "PaperPilot AI — Industrial Grade Change Copilot",
    description: "Real-time off-spec risk prevention powered by XGBoost, SHAP, LangGraph, and Groq LLM explanations.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="bg-[#081120] text-slate-100 min-h-screen antialiased selection:bg-red-500/80 selection:text-white">
        <Navbar />
        <main className="w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
