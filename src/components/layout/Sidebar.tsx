"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitPullRequest,
  Code2,
  CheckSquare,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Target,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { currentUser, activeUserSummary } = useStore();

  const navItems: NavItem[] = [
    { name: "Command Center", href: "/", icon: LayoutDashboard },
    {
      name: "Syllabus Pipeline",
      href: "/topics",
      icon: GitPullRequest,
      badge: `${activeUserSummary.topicsMastered}/${activeUserSummary.topicsTotal}`,
    },
    {
      name: "LeetCode Tracker",
      href: "/leetcode",
      icon: Code2,
      badge: `${activeUserSummary.leetcodeTotal}`,
    },
    {
      name: "Daily Tasks",
      href: "/tasks",
      icon: CheckSquare,
      badge: `${activeUserSummary.dailyTasksCompleted}/${activeUserSummary.dailyTasksTotal}`,
    },
    {
      name: "Performance Tracking",
      href: "/performance",
      icon: BarChart3,
      badge: `${activeUserSummary.overallProgressPercent}%`,
    },
    {
      name: "Shared Admin Panel",
      href: "/admin",
      icon: ShieldCheck,
      adminOnly: false, // Both Anuraj and Soumyajit are Admins
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0A0D14] border-r border-white/[0.07] flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-white/[0.07] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#141A26] border border-[#C5A059]/40 text-[#D8B668] flex items-center justify-center font-bold text-xs tracking-wider">
              SAP
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-slate-100 uppercase">
                MISSION 2027
              </div>
              <div className="text-[10px] text-[#C5A059] font-medium tracking-wide">
                ANURAJ × SOUMYAJIT
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Preparation Modules
          </div>

          {navItems.map((item: NavItem) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href)) ||
              (item.href === "/performance" && pathname.startsWith("/comparison"));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group active:scale-[0.99] ${
                  isActive
                    ? "bg-[#141A26] text-white border border-[#C5A059]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)]"
                    : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive ? "bg-[#C5A059]/15 text-[#D8B668]" : "bg-[#0E121B] text-slate-400 group-hover:text-slate-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive
                        ? "bg-[#C5A059]/15 text-[#D8B668] border border-[#C5A059]/30"
                        : "bg-[#0E121B] text-slate-400 border border-white/[0.05]"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Footer Mission Meta */}
        <div className="p-3.5 m-3 rounded-xl bg-[#0E121B] border border-white/[0.06] text-[11px] space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Target Date</span>
            <span className="font-mono text-[#D8B668]">1 July 2027</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Logged in as</span>
            <span className="text-slate-200 font-semibold">{currentUser.fullName}</span>
          </div>
          <div className="w-full bg-[#141A26] h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-[#C5A059] rounded-full transition-all"
              style={{ width: `${activeUserSummary.overallProgressPercent}%` }}
            />
          </div>
        </div>
      </aside>
    </>
  );
};
