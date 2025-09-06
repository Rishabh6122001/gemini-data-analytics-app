import React, { useState, useRef, useEffect } from 'react';
import { Send, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { geminiService } from '../services/geminiService';

interface ChatInterfaceProps {
  onResetApiKey: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onResetApiKey }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content:
        "Hello! I'm your Data Analytics AI Assistant. I'm here to help you with all your data analysis, statistics, visualization, and business intelligence questions. What would you like to know?",
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await geminiService.generateResponse(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I apologize, but I encountered an error while processing your request. Please check your API key in the .env file and try again. Error: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        content:
          "Hello! I'm your Data Analytics AI Assistant. I'm here to help you with all your data analysis, statistics, visualization, and business intelligence questions. What would you like to know?",
        role: 'assistant',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-2">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Data Analytics AI</h1>
              <p className="text-sm text-gray-600">
                Specialized in data analysis and insights
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearConversation}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <RefreshCw size={20} />
            </button>
            <button
              onClick={onResetApiKey}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Change API key"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && <LoadingBubble />}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about data analysis, statistics, visualization, or any analytics topic..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>

          <div className="mt-2 text-xs text-gray-500 text-center">
            This AI specializes in data analytics. Ask about statistics, data
            visualization, business intelligence, and more.
          </div>
        </div>
      </div>
    </div>
  );
};
