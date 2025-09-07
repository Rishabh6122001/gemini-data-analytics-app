import React from "react";
import { User, Bot } from "lucide-react";
import { Message } from "../types";
import { ChartRenderer } from "./ChartRenderer";

interface MessageBubbleProps {
  message: Message;
  onFollowUpClick?: (query: string) => void; // 👈 callback for follow-ups
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onFollowUpClick,
}) => {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      {/* 🤖 Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* 💬 Message content */}
      <div className={`max-w-[70%] ${isUser ? "order-1" : "order-2"}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-blue-600 text-white rounded-tr-md"
              : "bg-white border border-gray-200 text-gray-900 rounded-tl-md shadow-sm"
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {isUser ? message.content : message.answer || message.content}
          </p>
        </div>

        {/* 📊 Chart Rendering (assistant only) */}
        {!isUser && message.chart && (
          <div className="mt-3 border rounded-lg p-2 bg-white shadow-sm">
            <ChartRenderer
              type={message.chart.type}
              data={message.chart.data}
              xKey={message.chart.xKey}
              yKey={message.chart.yKey}
            />
          </div>
        )}

        {/* 🔎 Follow-up Suggestions */}
        {!isUser && message.followUps && message.followUps.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.followUps.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onFollowUpClick?.(q)}
                className="text-xs px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 👤 User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 order-2">
          <div className="bg-gray-300 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      )}
    </div>
  );
};
