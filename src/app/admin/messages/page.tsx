"use client";

import { useState } from "react";

const mockChats = [
  { id: "CHAT-1", user: "Khách vãng lai #401", latestMessage: "Tôi cần báo giá 10 tấm pin Mono", time: "10:24 AM", unread: 2, status: "online" },
  { id: "CHAT-2", user: "Nguyễn Văn A", latestMessage: "Biến tần này có sẵn không shop?", time: "Hôm qua", unread: 0, status: "offline" },
  { id: "CHAT-3", user: "Lê Thị B", latestMessage: "Cảm ơn bạn đã tư vấn", time: "14/10/2023", unread: 0, status: "offline" },
];

export default function AdminMessagesPage() {
  const [activeChat, setActiveChat] = useState(mockChats[0].id);

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface font-headline">Hỗ trợ trực tuyến (Live Chat)</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Tư vấn, trả lời câu hỏi và hỗ trợ khách hàng theo thời gian thực.
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm h-full flex overflow-hidden">
        {/* Chat List (Sidebar) */}
        <div className="w-1/3 border-r border-outline-variant flex flex-col bg-surface-container-lowest">
          <div className="p-4 border-b border-outline-variant">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input 
                type="text" 
                placeholder="Tìm đoạn chat..." 
                className="w-full pl-9 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockChats.map((chat) => (
              <div 
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={`p-4 border-b border-outline-variant/50 cursor-pointer transition-colors ${
                  activeChat === chat.id ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-surface-container-low"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-on-surface line-clamp-1">{chat.user}</h3>
                    {chat.status === "online" && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                  </div>
                  <span className="text-xs text-on-surface-variant shrink-0">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-xs line-clamp-1 ${chat.unread > 0 ? "font-bold text-on-surface" : "text-on-surface-variant"}`}>
                    {chat.latestMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-surface">
          {/* Chat Header */}
          <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                K
              </div>
              <div>
                <h2 className="font-semibold text-on-surface">Khách vãng lai #401</h2>
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang trực tuyến
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-on-surface-variant hover:text-primary rounded-lg transition-colors" title="Chuyển thành Đơn hàng/Báo giá">
                <span className="material-symbols-outlined">receipt_long</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-error rounded-lg transition-colors" title="Chặn người dùng">
                <span className="material-symbols-outlined">block</span>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-surface-container-lowest/50">
            {/* Incoming Message */}
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 flex items-center justify-center text-primary text-sm font-bold">
                K
              </div>
              <div>
                <div className="bg-surface-container-high text-on-surface p-3 rounded-2xl rounded-tl-sm text-sm">
                  Chào shop, mình đang tìm hiểu về Biến tần Siemens 5kW bên mình đang bán.
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 ml-1">10:20 AM</span>
              </div>
            </div>
            
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 opacity-0 shrink-0"></div>
              <div>
                <div className="bg-surface-container-high text-on-surface p-3 rounded-2xl rounded-tl-sm text-sm">
                  Tôi cần báo giá 10 tấm pin Mono
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 ml-1">10:24 AM</span>
              </div>
            </div>

            {/* Outgoing Message */}
            <div className="flex gap-3 max-w-[80%] self-end flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                A
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-primary text-on-primary p-3 rounded-2xl rounded-tr-sm text-sm shadow-sm">
                  Dạ chào bạn, số lượng 10 tấm bên mình vẫn còn hàng tại kho TP.HCM. Bạn cho mình xin SĐT hoặc email để mình gửi báo giá chính thức kèm chiết khấu nhé!
                </div>
                <span className="text-[10px] text-on-surface-variant mt-1 mr-1">Vừa xong</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-outline-variant bg-surface">
            <div className="flex gap-2">
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">attach_file</span>
              </button>
              <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                <span className="material-symbols-outlined">image</span>
              </button>
              <input 
                type="text" 
                placeholder="Nhập tin nhắn trả lời khách hàng..." 
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
              />
              <button className="px-4 py-2 bg-primary text-on-primary rounded-xl font-medium text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-sm">
                Gửi <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
