"use client";

import React from "react";
import { useStore } from "@/lib/store/useStore";
import { Sparkles } from "lucide-react";

export const MissionBanner: React.FC = () => {
  const { db } = useStore();

  if (!db.missionConfig.announcement?.active || !db.missionConfig.announcement?.text) {
    return null;
  }

  return (
    <div className="w-full bg-[#141A26] border-b border-white/[0.06] py-1.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0" />
          <span className="font-medium truncate">{db.missionConfig.announcement.text}</span>
        </div>
      </div>
    </div>
  );
};
