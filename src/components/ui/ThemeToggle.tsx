"use client";

import React from "react";
import { useStore } from "@/lib/store/useStore";
import { Moon, Sun } from "lucide-react";

export const ThemeToggle: React.FC = () => {
  const { db, setTheme } = useStore();
  const isDark = db.theme !== "light";

  const toggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-sap-charcoal border border-sap-border hover:border-sap-borderLight text-slate-300 hover:text-sap-gold transition-colors"
      title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-4 h-4 text-sap-gold-light" /> : <Moon className="w-4 h-4 text-slate-600" />}
    </button>
  );
};
