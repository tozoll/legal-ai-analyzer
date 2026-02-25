"use client";

import { motion } from "framer-motion";
import { FileSearch, Brain, Sparkles, CheckCircle } from "lucide-react";

interface Step {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: "pending" | "active" | "done";
}

interface AnalysisProgressProps {
  status: string;
  progress: number;
  message: string;
}

export function AnalysisProgress({ status, progress, message }: AnalysisProgressProps) {
  const steps: Step[] = [
    {
      id: "uploading",
      label: "Dosya Yükleniyor",
      icon: <FileSearch className="h-5 w-5" />,
      status:
        status === "uploading" ? "active" : ["extracting", "analyzing", "complete"].includes(status) ? "done" : "pending",
    },
    {
      id: "extracting",
      label: "Metin Çıkarılıyor",
      icon: <FileSearch className="h-5 w-5" />,
      status:
        status === "extracting" ? "active" : ["analyzing", "complete"].includes(status) ? "done" : "pending",
    },
    {
      id: "analyzing",
      label: "Claude AI Analiz Ediyor",
      icon: <Brain className="h-5 w-5" />,
      status: status === "analyzing" ? "active" : status === "complete" ? "done" : "pending",
    },
    {
      id: "complete",
      label: "Rapor Hazır",
      icon: <Sparkles className="h-5 w-5" />,
      status: status === "complete" ? "done" : "pending",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-6"
    >
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">{message}</span>
          <span className="text-violet-400 font-medium">{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center gap-2 text-center">
            <motion.div
              animate={
                step.status === "active"
                  ? { scale: [1, 1.05, 1], opacity: 1 }
                  : { scale: 1, opacity: step.status === "done" ? 1 : 0.4 }
              }
              transition={
                step.status === "active"
                  ? { repeat: Infinity, duration: 2 }
                  : {}
              }
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                step.status === "done"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : step.status === "active"
                  ? "border-violet-500/50 bg-violet-500/15 text-violet-400"
                  : "border-slate-700 bg-slate-800/50 text-slate-600"
              }`}
            >
              {step.status === "done" ? (
                <CheckCircle className="h-5 w-5" />
              ) : step.status === "active" ? (
                <div className="relative">
                  {step.icon}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-violet-400/20"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
              ) : (
                step.icon
              )}
            </motion.div>
            <span
              className={`text-xs font-medium leading-tight ${
                step.status === "done"
                  ? "text-emerald-400"
                  : step.status === "active"
                  ? "text-violet-300"
                  : "text-slate-600"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* AI thinking animation */}
      {status === "analyzing" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-violet-500/5 border border-violet-500/10 p-4"
        >
          <div className="flex items-center gap-3 mb-3">
            <Brain className="h-4 w-4 text-violet-400" />
            <span className="text-sm font-medium text-violet-300">Claude AI hukuki analiz yapıyor...</span>
          </div>
          <div className="space-y-2">
            {["Madde ve koşullar inceleniyor", "Risk faktörleri değerlendiriliyor", "Hukuki uyum kontrol ediliyor"].map(
              (text, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: [0, 1, 1, 0.3], x: 0 }}
                  transition={{ delay: i * 0.8, duration: 2, repeat: Infinity, repeatDelay: 1.5 }}
                  className="flex items-center gap-2 text-xs text-slate-400"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />
                  {text}
                </motion.div>
              )
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
