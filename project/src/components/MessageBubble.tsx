import React from 'react';
import { User, Bot, Clock } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2 w-10 h-10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-md'
              : 'bg-white border border-gray-200 text-gray-900 rounded-tl-md shadow-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
        
        <div className={`flex items-center gap-1 mt-2 text-xs text-gray-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <Clock size={12} />
          <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

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