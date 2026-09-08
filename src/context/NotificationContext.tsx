"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type NotificationType = "success" | "warning" | "error" | "info";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 3000);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "check_circle";
      case "warning":
        return "warning";
      case "error":
        return "error";
      case "info":
        return "info";
    }
  };

  const getIconColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "text-emerald-600";
      case "warning":
        return "text-amber-600";
      case "error":
        return "text-rose-600";
      case "info":
        return "text-blue-600";
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 shadow-emerald-900/10";
      case "warning":
        return "border-amber-500/30 shadow-amber-900/10";
      case "error":
        return "border-rose-500/30 shadow-rose-900/10";
      case "info":
        return "border-blue-500/30 shadow-blue-900/10";
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Floating Notifications UI Container */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.08)] border border-white/60 transition-all duration-300 transform translate-x-0 animate-slide-in-right relative overflow-hidden`}
          >
            {/* Liquid Glass Highlight Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/50 to-white/10 pointer-events-none mix-blend-overlay"></div>
            
            <div className={`w-1 absolute left-0 top-0 bottom-0 ${n.type === "success" ? "bg-emerald-500" : n.type === "warning" ? "bg-amber-500" : n.type === "error" ? "bg-rose-500" : "bg-blue-500"}`}></div>

            <span className={`material-symbols-outlined text-2xl shrink-0 mt-0.5 select-none z-10 ${getIconColor(n.type)}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {getIcon(n.type)}
            </span>
            <div className="flex-1 z-10">
              <p className={`text-[10px] font-extrabold tracking-widest uppercase select-none ${getIconColor(n.type)}`}>
                {n.type === "success" && "Thành công"}
                {n.type === "warning" && "Cảnh báo"}
                {n.type === "error" && "Lỗi kỹ thuật"}
                {n.type === "info" && "Thông tin"}
              </p>
              <p className="text-[13px] font-bold mt-1 select-none leading-snug text-slate-700">
                {n.message}
              </p>
            </div>
            <button
              onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
              className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1 rounded-full transition-colors shrink-0 mt-0 z-10"
            >
              <span className="material-symbols-outlined text-[16px] flex items-center justify-center">close</span>
            </button>
          </div>
        ))}
      </div>

      {/* Embedded style keyframe animations */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
