import React, { useState, useRef, useEffect } from 'react';
import { Send, BarChart3, RefreshCw } from 'lucide-react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { geminiService } from '../services/geminiService';

const STORAGE_KEY = "chat-history";

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
      } catch {
        return [getInitialMessage()];
      }
    }
    return [getInitialMessage()];
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function getInitialMessage(): Message {
    return {
      id: '1',
      content:
        "👋 Hello! I'm your Data Analytics AI Assistant. I specialize in statistics, visualization, business intelligence, and data science. What would you like to explore?",
      role: 'assistant',
      timestamp: new Date(),
      followUps: ["How do I clean messy datasets?", "What’s the best way to visualize trends?", "How to choose between regression models?"],
    };
  }

  // Save history
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages.map((m) => ({ ...m })))
    );
  }, [messages]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (query: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInputValue('');

    try {
      const { answer, followUps } = await geminiService.generateResponse(query);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        role: 'assistant',
        timestamp: new Date(),
        followUps,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            "⚠️ Sorry, something went wrong while fetching the response. Please try again.",
          role: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
  };

  const clearConversation = () => {
    setMessages([getInitialMessage()]);
    localStorage.removeItem(STORAGE_KEY);
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

          <button
            onClick={clearConversation}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-4">
              <MessageBubble message={message} />

              {/* Follow-up suggestions */}
              {message.role === 'assistant' &&
                message.followUps &&
                message.followUps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.followUps.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(q)}
                        className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}

          {isLoading && <LoadingBubble />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about data analysis, statistics, visualization..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="mt-2 text-xs text-gray-500 text-center">
            This AI specializes in data analytics. Ask about statistics, visualization, BI, and more.
          </div>
        </div>
      </div>
    </div>
  );
};
