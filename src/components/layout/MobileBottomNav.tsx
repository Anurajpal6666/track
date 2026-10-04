"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitPullRequest,
  Code2,
  CheckSquare,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { activeUserSummary } = useStore();

  const navItems = [
    {
      name: "Home",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      name: "Syllabus",
      href: "/topics",
      icon: GitPullRequest,
      active: pathname.startsWith("/topics"),
      badge: `${activeUserSummary.topicsMastered}/${activeUserSummary.topicsTotal}`,
    },
    {
      name: "LeetCode",
      href: "/leetcode",
      icon: Code2,
      active: pathname.startsWith("/leetcode"),
      badge: `${activeUserSummary.leetcodeTotal}`,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      active: pathname.startsWith("/tasks"),
      badge: `${activeUserSummary.dailyTasksCompleted}`,
    },
    {
      name: "Admin",
      href: "/admin",
      icon: ShieldCheck,
      active: pathname.startsWith("/admin"),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-t border-white/[0.08] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)]"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative min-h-[48px] touch-manipulation active:scale-95 ${
                item.active
                  ? "text-[#D8B668]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    item.active ? "text-[#C5A059] scale-110" : "text-slate-400"
                  }`}
                />
                {item.badge && item.active ? (
                  <span className="absolute -top-1.5 -right-2.5 px-1 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#C5A059] text-[#080A0F] leading-none">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium tracking-tight ${
                  item.active ? "text-[#D8B668] font-bold" : "text-slate-400"
                }`}
              >
                {item.name}
              </span>
              {item.active && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="absolute bottom-0 w-8 h-0.5 rounded-full bg-[#C5A059] shadow-[0_0_8px_#C5A059]"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
