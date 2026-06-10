import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";

interface ChatRoomProps {
  currentUserId: string;
  receiverId: string;
  receiverName: string;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  currentUserId,
  receiverId,
  receiverName,
}) => {
  const { messages, sendMessage, isConnected } = useChat(
    currentUserId,
    receiverId,
  );
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-150 w-full max-w-md border border-gray-300 rounded-lg bg-white shadow-md">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between rounded-t-lg">
        <h3 className="font-semibold text-gray-800">{receiverName}</h3>
        <span className="flex items-center text-xs text-gray-500">
          <div
            className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500"}`}
          />
          {isConnected ? "Connected" : "Reconnecting..."}
        </span>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-100">
        {messages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id || index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] p-3 rounded-lg ${isMe ? "bg-blue-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none shadow-sm"}`}
              >
                {/* Fallback to 'You' if sender_name is undefined for optimistic updates */}
                {!isMe && (
                  <span className="block text-xs text-gray-500 mb-1">
                    {msg.sender_name || receiverName}
                  </span>
                )}
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-white border-t rounded-b-lg flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || !isConnected}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
};
