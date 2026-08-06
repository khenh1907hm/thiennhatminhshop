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
        return "text-emerald-400";
      case "warning":
        return "text-amber-400";
      case "error":
        return "text-rose-400";
      case "info":
        return "text-blue-400";
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "border-emerald-500/30 shadow-emerald-950/20";
      case "warning":
        return "border-amber-500/30 shadow-amber-950/20";
      case "error":
        return "border-rose-500/30 shadow-rose-950/20";
      case "info":
        return "border-blue-500/30 shadow-blue-950/20";
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
            className={`pointer-events-auto flex items-start gap-3.5 p-4 rounded-xl border bg-slate-900/95 backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-x-0 animate-slide-in-right ${getBorderColor(
              n.type
            )}`}
          >
            <span className={`material-symbols-outlined text-xl shrink-0 mt-0.5 select-none ${getIconColor(n.type)}`}>
              {getIcon(n.type)}
            </span>
            <div className="flex-1">
              <p className={`text-[10px] font-bold tracking-widest uppercase select-none ${getIconColor(n.type)}`}>
                {n.type === "success" && "Thành công"}
                {n.type === "warning" && "Cảnh báo"}
                {n.type === "error" && "Lỗi kỹ thuật"}
                {n.type === "info" && "Thông tin"}
              </p>
              <p className="text-xs font-semibold mt-1 select-none leading-relaxed text-slate-100">
                {n.message}
              </p>
            </div>
            <button
              onClick={() => setNotifications((prev) => prev.filter((item) => item.id !== n.id))}
              className="text-slate-400 hover:text-white transition-colors shrink-0 mt-0.5"
            >
              <span className="material-symbols-outlined text-sm">close</span>
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
