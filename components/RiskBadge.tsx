"use client";

import { RiskLevel } from "@/types/analysis";
import { getRiskColor, getRiskLabel } from "@/lib/utils";
import { Shield, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const icons = {
  low: Shield,
  medium: AlertTriangle,
  high: ShieldAlert,
  critical: ShieldX,
};

const bgColors = {
  low: "bg-emerald-400/10 border-emerald-400/25 text-emerald-400",
  medium: "bg-amber-400/10 border-amber-400/25 text-amber-400",
  high: "bg-orange-400/10 border-orange-400/25 text-orange-400",
  critical: "bg-red-400/10 border-red-400/25 text-red-400",
};

const sizes = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
  lg: "text-base px-4 py-2",
};

export function RiskBadge({ level, size = "md", showIcon = true }: RiskBadgeProps) {
  const Icon = icons[level];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        bgColors[level],
        sizes[size]
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-4 w-4"} />}
      {getRiskLabel(level)}
    </span>
  );
}
