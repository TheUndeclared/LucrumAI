"use client";

import { Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import React from "react";

export default function ConfidenceScore({
  confidenceLevel,
}: {
  confidenceLevel: string;
}) {
  // Determine style & icon based on confidence
  let confidenceColor = "text-muted-foreground";
  let ConfidenceIcon = Activity;
  let glowColor = "from-muted-foreground/10 to-muted-foreground/0";

  if (confidenceLevel === "HIGH") {
    confidenceColor = "text-green-500";
    ConfidenceIcon = ShieldCheck;
    glowColor = "from-green-500/20 to-green-500/0";
  } else if (confidenceLevel === "MEDIUM") {
    confidenceColor = "text-blue-500";
    ConfidenceIcon = Activity;
    glowColor = "from-blue-500/20 to-blue-500/0";
  } else if (confidenceLevel === "LOW") {
    confidenceColor = "text-yellow-500";
    ConfidenceIcon = AlertTriangle;
    glowColor = "from-yellow-500/20 to-yellow-500/0";
  }

  return (
    <div className="relative group overflow-hidden rounded-xl border border-border/60 bg-background/80 p-5 backdrop-blur-lg shadow-sm transition hover:shadow-md">
      {/* subtle animated glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${glowColor} opacity-0 group-hover:opacity-100 transition duration-700 blur-2xl`}
      />

      {/* Header */}
      <h3 className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
        Confidence Score
      </h3>

      {/* Main Content */}
      <div
        className={`relative z-10 flex items-center gap-3 ${confidenceColor} transition-transform duration-300 group-hover:scale-[1.03]`}
      >
        <div className="grid place-items-center h-10 w-10 rounded-full bg-background/70 ring-1 ring-border">
          <ConfidenceIcon className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-2xl font-semibold leading-none">
            {confidenceLevel}
          </span>
          <span className="text-xs text-muted-foreground">model confidence</span>
        </div>
      </div>
    </div>
  );
}
