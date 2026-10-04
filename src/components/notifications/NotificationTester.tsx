"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store/useStore";
import { NotificationEngine } from "@/lib/services/notificationService";
import { Bell, Send, CheckCircle2, Clock } from "lucide-react";

interface NotificationTesterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationTester: React.FC<NotificationTesterProps> = ({ isOpen, onClose }) => {
  const { db, sendNotificationAnnouncement } = useStore();
  const [customTitle, setCustomTitle] = useState("SAP Labs Mission Checkpoint");
  const [customBody, setCustomBody] = useState("Daily preparation target: Solve 2 Medium LeetCode problems & review SAP HANA columnar architecture.");
  const [sentStatus, setSentStatus] = useState<string | null>(null);

  const handleTestSchedule = (sched: typeof db.notificationSchedules[0]) => {
    NotificationEngine.showSystemNotification(sched.title, sched.defaultMessage);
    sendNotificationAnnouncement(sched.title, sched.defaultMessage);
    setSentStatus(`Dispatched: ${sched.title}`);
    setTimeout(() => setSentStatus(null), 3000);
  };

  const handleCustomDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customBody.trim()) return;

    NotificationEngine.showSystemNotification(customTitle, customBody);
    sendNotificationAnnouncement(customTitle, customBody);
    setSentStatus("Custom notification dispatched to active session!");
    setTimeout(() => setSentStatus(null), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notification Engine & Push Tester" subtitle="Test Web Push API, Service Worker triggers, and audio chimes" maxWidth="lg">
      <div className="space-y-6">
        {sentStatus && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{sentStatus}</span>
          </div>
        )}

        {/* Preset Scheduled Reminders */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2 uppercase tracking-wider">
            Test Preset Automated Schedules (5 Daily Windows)
          </label>
          <div className="space-y-2">
            {db.notificationSchedules.map((sched) => (
              <div
                key={sched.id}
                className="flex items-center justify-between p-3 rounded-lg bg-sap-charcoal border border-sap-border hover:border-sap-borderLight transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-sap-surface flex items-center justify-center text-xs font-bold text-sap-gold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-100 flex items-center gap-2">
                      <span>{sched.time}</span>
                      <span className="text-sap-silver">•</span>
                      <span>{sched.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 max-w-sm truncate">{sched.defaultMessage}</div>
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => handleTestSchedule(sched)}>
                  Trigger Now
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Broadcast */}
        <form onSubmit={handleCustomDispatch} className="space-y-3 pt-3 border-t border-sap-border">
          <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
            Send Custom Push Alert / Administrator Announcement
          </label>
          <div>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Notification Title..."
              className="w-full text-xs px-3 py-2 bg-sap-charcoal border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
              required
            />
          </div>
          <div>
            <textarea
              value={customBody}
              onChange={(e) => setCustomBody(e.target.value)}
              placeholder="Notification Message body..."
              rows={2}
              className="w-full text-xs px-3 py-2 bg-sap-charcoal border border-sap-border rounded-lg text-slate-100 focus:outline-none focus:border-sap-gold"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" variant="gold" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
              Transmit Push & Chime
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
