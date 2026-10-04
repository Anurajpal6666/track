"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { NotificationEngine } from "@/lib/services/notificationService";
import { Bell, Sparkles, AlertCircle, Info, Check } from "lucide-react";

export const NotificationCenter: React.FC = () => {
  const { db, currentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Filter notifications for current user or broadcast "all"
  const userNotifs = db.notificationLogs.filter(
    (n) => n.userId === "all" || n.userId === currentUser.id
  );

  const unreadCount = userNotifs.filter((n) => !n.read).length;

  const requestPushPermission = async () => {
    const perm = await NotificationEngine.requestPermission();
    if (perm === "granted") {
      NotificationEngine.showSystemNotification(
        "SAP Labs Mission 2027",
        "Push notifications enabled. Daily reminders scheduled for 8:00 AM, 1:00 PM, and 9:00 PM."
      );
    }
  };

  const triggerTestNotification = () => {
    NotificationEngine.showSystemNotification(
      "Mission 2027 Daily Checkpoint",
      "8:00 AM Reminder: Start today's DSA & SAP preparation. 1 July 2027 is the target."
    );
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-[#141A26] border border-white/[0.08] hover:border-[#C5A059]/40 text-slate-300 hover:text-white transition-colors"
        title="Notifications"
        aria-label="Notification Center"
      >
        <Bell className="w-4 h-4 text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C5A059] text-[#080A0F] text-[10px] font-bold flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-2 z-50">
            <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  Daily Push Notifications
                </h4>
                <p className="text-[11px] text-slate-400">8 AM &bull; 1 PM &bull; 9 PM reminders</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={triggerTestNotification}
                  className="text-[10px] px-2 py-1 rounded bg-[#141A26] text-[#D8B668] hover:bg-slate-800 border border-white/[0.08] font-medium"
                >
                  {testSent ? "Dispatched!" : "Test Notification"}
                </button>
                <button
                  onClick={requestPushPermission}
                  className="text-[10px] px-2 py-1 rounded bg-[#C5A059] text-[#080A0F] font-bold hover:bg-[#D8B668]"
                >
                  Enable Push
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
              {userNotifs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No active notifications.
                </div>
              ) : (
                userNotifs.map((notif) => (
                  <div key={notif.id} className="p-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-md bg-[#141A26] flex-shrink-0 flex items-center justify-center mt-0.5 border border-white/[0.06]">
                        {notif.category === "announcement" ? (
                          <AlertCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#D8B668]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-200">{notif.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(notif.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {notif.body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
