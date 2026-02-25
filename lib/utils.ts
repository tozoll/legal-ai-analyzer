import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel } from "@/types/analysis";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "low": return "text-emerald-400";
    case "medium": return "text-amber-400";
    case "high": return "text-orange-400";
    case "critical": return "text-red-400";
    default: return "text-slate-400";
  }
}

export function getRiskBg(level: RiskLevel): string {
  switch (level) {
    case "low": return "bg-emerald-400/10 border-emerald-400/20";
    case "medium": return "bg-amber-400/10 border-amber-400/20";
    case "high": return "bg-orange-400/10 border-orange-400/20";
    case "critical": return "bg-red-400/10 border-red-400/20";
    default: return "bg-slate-400/10 border-slate-400/20";
  }
}

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "low": return "Düşük Risk";
    case "medium": return "Orta Risk";
    case "high": return "Yüksek Risk";
    case "critical": return "Kritik Risk";
    default: return "Bilinmiyor";
  }
}

export function getScoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  if (score >= 25) return "text-orange-400";
  return "text-red-400";
}
