"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Clock, Coins } from "lucide-react";
import { AccountSwitcher } from "@/components/ui/AccountSwitcher";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useStore } from "@/lib/store/useStore";

interface NavbarProps {
  onMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { db, activeUserWallet, currentUser } = useStore();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(db.missionConfig.targetDeadline).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [db.missionConfig.targetDeadline]);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#080A0F]/90 backdrop-blur-md border-b border-white/[0.07] flex items-center justify-between px-4 sm:px-6">
      {/* Left side: Mobile menu toggle + Mini Countdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-[#141A26] border border-white/[0.08] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.08)] text-slate-300 hover:text-white active:scale-95 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Real-time Mini Countdown Pill - Lovable Full-Pill */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141A26] border border-white/[0.08] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)] hover:border-[#C5A059]/40 active:scale-98 transition-all text-xs group"
        >
          <Clock className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
          <div className="flex items-center gap-1.5 font-mono text-slate-200 font-medium">
            <span className="font-bold text-[#D8B668]">{timeLeft.days}d</span>
            <span>{timeLeft.hours.toString().padStart(2, "0")}h</span>
            <span>{timeLeft.minutes.toString().padStart(2, "0")}m</span>
            <span className="hidden sm:inline text-slate-400">{timeLeft.seconds.toString().padStart(2, "0")}s</span>
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider hidden md:inline font-mono">
            • 1 July 2027
          </span>
        </Link>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2.5">
        {/* Virtual Money Balance Pill */}
        <Link
          href="/leetcode"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141A26] border border-[#C5A059]/40 hover:border-[#C5A059] hover:bg-[#1A2233] transition-all text-xs shadow-sm group"
          title={`${currentUser.fullName}'s Virtual Money Balance`}
        >
          <Coins className="w-3.5 h-3.5 text-[#D8B668] group-hover:rotate-12 transition-transform" />
          <span className="font-mono font-bold text-[#D8B668]">
            {db.economySettings?.currencySymbol || "₹"}{activeUserWallet.balance.toLocaleString()}
          </span>
        </Link>
        <NotificationCenter />
        <AccountSwitcher />
      </div>
    </header>
  );
};
