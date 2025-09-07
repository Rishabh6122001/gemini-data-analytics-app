import React, { useState, useRef } from "react";
import { Send, Upload } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void; // ✅ new prop
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onFileUpload }) => {
  const [input, setInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-end gap-2">
      {/* Textarea */}
      <textarea
        className="flex-1 resize-none border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={1}
        placeholder="Type a message... (Shift+Enter for new line)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Upload button */}
      <button
        type="button"
        onClick={triggerFileUpload}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        title="Upload file"
      >
        <Upload size={18} />
      </button>
      <input
        type="file"
        accept=".csv,.json,.xlsx,.xls"
        ref={fileInputRef}
        className="hidden"
        onChange={onFileUpload}
      />

      {/* Send button */}
      <button
        type="button"
        onClick={handleSend}
        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        title="Send"
      >
        <Send size={18} />
      </button>
    </div>
  );
};
