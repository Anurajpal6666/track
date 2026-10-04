"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import { Calendar, Target, Clock, ShieldCheck } from "lucide-react";

export const CountdownTimer: React.FC = () => {
  const { db } = useStore();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isCompleted: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isCompleted: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(db.missionConfig.targetDeadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isCompleted: true,
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isCompleted: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [db.missionConfig.targetDeadline]);

  const digitVariants = {
    initial: { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, y: 4, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative rounded-2xl bg-[#0E121B] border border-white/[0.08] border-t-white/[0.15] p-5 sm:p-6 lg:p-7 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)] overflow-hidden transition-all group"
    >
      {/* Subtle radial ambient highlight */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[radial-gradient(ellipse_at_top,rgba(197,160,89,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute -bottom-24 left-0 w-80 h-80 bg-[radial-gradient(ellipse_at_bottom,rgba(43,82,126,0.1),transparent_70%)] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Header information */}
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141A26] border border-white/[0.08] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.1)] text-xs">
            <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#D8B668] uppercase">
              Mission Countdown
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] text-slate-300 font-mono">1 July 2027</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 flex items-center gap-3">
            <span>SAP LABS — MISSION 2027</span>
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 text-[#D8B668] font-bold tracking-wider text-[11px] border border-[#C5A059]/30">
              ANURAJ × SOUMYAJIT
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Start: 4 October 2026</span>
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <Target className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Target: 1 July 2027</span>
            </span>
          </div>
        </div>

        {/* 4 Countdown Digits - Lovable tactile boxes with Framer Motion spring */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Days */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#141A26] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.3)] min-w-[70px] sm:min-w-[84px] cursor-default"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timeLeft.days}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-slate-100 tracking-tight"
              >
                {timeLeft.days}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Days
            </span>
          </motion.div>

          {/* Hours */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#141A26] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.3)] min-w-[70px] sm:min-w-[84px] cursor-default"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timeLeft.hours}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-[#D8B668] tracking-tight"
              >
                {timeLeft.hours.toString().padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Hours
            </span>
          </motion.div>

          {/* Minutes */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#141A26] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.3)] min-w-[70px] sm:min-w-[84px] cursor-default"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timeLeft.minutes}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-slate-200 tracking-tight"
              >
                {timeLeft.minutes.toString().padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Mins
            </span>
          </motion.div>

          {/* Seconds */}
          <motion.div
            whileHover={{ y: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl bg-[#141A26] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_0_1px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.3)] min-w-[70px] sm:min-w-[84px] cursor-default"
          >
            <AnimatePresence mode="popLayout">
              <motion.span
                key={timeLeft.seconds}
                variants={digitVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-2xl sm:text-3xl lg:text-4xl font-mono font-bold text-slate-300 tracking-tight"
              >
                {timeLeft.seconds.toString().padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Secs
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
