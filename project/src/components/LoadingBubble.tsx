import React from 'react';
import { Bot } from 'lucide-react';

export const LoadingBubble: React.FC = () => {
  return (
    <div className="flex gap-3 justify-start mb-6">
      <div className="flex-shrink-0">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-2 w-10 h-10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>
      
      <div className="max-w-[70%]">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          <div className="flex items-center gap-1">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm text-gray-500 ml-2">Analyzing your query...</span>
          </div>
        </div>
      </div>
    </div>
  );
};