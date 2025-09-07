import React, { useState, useRef, useEffect } from "react";
import { BarChart3, RefreshCw } from "lucide-react";
import { Message } from "../types";
import { MessageBubble } from "./MessageBubble";
import { LoadingBubble } from "./LoadingBubble";
import { ChartRenderer } from "./ChartRenderer";
import { geminiService } from "../services/geminiService";
import { ChatInput } from "./ChatInput";
import * as XLSX from "xlsx"; // ✅ Excel support

const STORAGE_KEY = "chat-history";

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedDataset, setUploadedDataset] = useState<any[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function getInitialMessage(): Message {
    return {
      id: "1",
      content:
        "👋 Hello! I'm your Data Analytics AI Assistant. I specialize in statistics, visualization, business intelligence, and data science. What would you like to explore?",
      role: "assistant",
      timestamp: new Date(),
      followUps: [
        "How do I clean messy datasets?",
        "What’s the best way to visualize trends?",
        "How to choose between regression models?",
      ],
    };
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sendMessage = async (
    query: string,
    dataset: any[] = uploadedDataset,
    fileName: string | null = uploadedFileName
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { answer, followUps, chart } = await geminiService.generateResponse(
        query,
        dataset,
        fileName
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: answer,
        role: "assistant",
        timestamp: new Date(),
        followUps,
        chart,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          content:
            "⚠️ Sorry, something went wrong while fetching the response. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([getInitialMessage()]);
    setUploadedDataset([]);
    setUploadedFileName(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // ✅ Fixed file upload (CSV, JSON, Excel support)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let dataset: any[] = [];

    try {
      if (file.name.endsWith(".json")) {
        const text = await file.text();
        dataset = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const [headerLine, ...lines] = text.trim().split("\n");
        const headers = headerLine.split(",");
        dataset = lines.map((line) => {
          const values = line.split(",");
          const row: Record<string, any> = {};
          headers.forEach((h, i) => {
            const num = parseFloat(values[i]);
            row[h.trim()] = isNaN(num) ? values[i] : num;
          });
          return row;
        });
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const data = new Uint8Array(await file.arrayBuffer());
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        dataset = XLSX.utils.sheet_to_json(sheet);
      }
    } catch (err) {
      console.error("❌ Failed to parse file:", err);
    }

    setUploadedDataset(dataset);
    setUploadedFileName(file.name);

    let preview = `📂 Uploaded file: **${file.name}**\n\n`;
    if (dataset.length > 0) {
      preview += `Parsed **${dataset.length} rows**. Example:\n\`\`\`json\n${JSON.stringify(
        dataset.slice(0, 3),
        null,
        2
      )}\n\`\`\``;
    } else {
      preview +=
        "⚠️ Could not parse dataset. Please upload valid CSV/JSON/Excel.";
    }

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content: preview,
        role: "assistant",
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
              <h1 className="text-xl font-bold text-gray-900">
                Data Analytics AI
              </h1>
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
              <MessageBubble message={message} onFollowUpClick={sendMessage} />
              {message.role === "assistant" && message.chart && (
                <ChartRenderer
                  type={message.chart.type}
                  data={message.chart.data}
                  xKey={message.chart.xKey}
                  yKey={message.chart.yKey}
                />
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
          {/* ✅ ChatInput with file upload */}
          <ChatInput
            onSend={(text) => sendMessage(text)}
            onFileUpload={handleFileUpload}
          />

          <div className="mt-2 text-xs text-gray-500 text-center">
            This AI specializes in data analytics. You can also upload
            CSV/JSON/Excel files for analysis.
          </div>
        </div>
      </div>
    </div>
  );
};
