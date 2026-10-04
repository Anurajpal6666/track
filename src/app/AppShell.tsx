"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { MissionBanner } from "@/components/layout/MissionBanner";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { NotificationEngine } from "@/lib/services/notificationService";

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Purge any corrupted caches from previous dev sessions
    if (typeof window !== "undefined" && "caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.update());
      });
    }
    // Register service worker for PWA & push notifications
    NotificationEngine.registerServiceWorker();
  }, []);

  return (
    <div className="min-h-screen bg-[#080A0F] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout Area offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <MissionBanner />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Persistent mobile bottom nav for phones & tablets */}
      <MobileBottomNav />
    </div>
  );
};
