"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { Shield, ChevronDown, Check } from "lucide-react";

export const AccountSwitcher: React.FC = () => {
  const { db, currentUser, setCurrentUser } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#141A26] border border-white/[0.08] hover:border-[#C5A059]/40 text-slate-200 text-xs font-medium transition-all"
      >
        <div className="w-6 h-6 rounded-md bg-[#0E121B] flex items-center justify-center text-[#D8B668] text-xs font-bold border border-[#C5A059]/30">
          {currentUser.fullName.charAt(0)}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5">
            {currentUser.fullName}
            <span className="text-[10px] px-1 py-0.2 bg-[#C5A059]/15 text-[#D8B668] border border-[#C5A059]/30 rounded">
              ADMIN
            </span>
          </div>
          <div className="text-[10px] text-slate-400">{currentUser.targetRole}</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-1.5 z-50">
            <div className="px-3 py-2 border-b border-white/[0.06]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Active Candidate
              </p>
            </div>
            {db.users.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors ${
                    isSelected
                      ? "bg-[#141A26] text-white font-semibold"
                      : "text-slate-300 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-[#141A26] flex items-center justify-center text-xs font-bold text-[#D8B668] border border-white/[0.08]">
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-slate-100 font-medium flex items-center gap-1.5">
                        {user.fullName}
                        <span className="text-[9px] px-1 bg-[#C5A059]/15 text-[#D8B668] border border-[#C5A059]/30 rounded font-mono">
                          ADMIN
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">{user.targetRole}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#C5A059]" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
