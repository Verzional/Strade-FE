"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "../../../../lib/api";
import { useChat } from "../../../hooks/useChat";

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const receiverId = params.id as string; // Safely grab the dynamic route ID

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState<string>("Loading...");
  const [isInitializing, setIsInitializing] = useState(true);

  // The hook will only attempt a WS connection once currentUserId is set
  const { messages, sendMessage, isConnected } = useChat(
    currentUserId || undefined,
    receiverId,
  );

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial Data Fetch: Get Current User AND Receiver Profile
  useEffect(() => {
    if (!receiverId) return;

    const initializeChat = async () => {
      try {
        // 1. Get Logged In User via your API wrapper
        const profileRes = await fetchWithAuth("/api/users/profile", {
          cache: "no-store",
        });

        if (profileRes.status === 401) {
          localStorage.removeItem("strade_token");
          router.replace("/login");
          return;
        }

        if (!profileRes.ok) throw new Error("Failed to load profile");
        const userData = await profileRes.json();
        setCurrentUserId(userData.id);

        // 2. Get Receiver's Public Profile (hits User Service GET /:id)
        const receiverRes = await fetchWithAuth(`/api/users/${receiverId}`);
        if (receiverRes.ok) {
          const receiverData = await receiverRes.json();
          // Assuming your user model returns 'name'
          setReceiverName(receiverData.name || "Unknown User");
        } else {
          setReceiverName("Unknown User");
        }
      } catch (error) {
        console.error("Chat initialization failed:", error);
        setReceiverName("Error Loading User");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [receiverId, router]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !currentUserId) return;

    sendMessage(inputValue);
    setInputValue("");
  };

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Establishing connection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white shadow-inner relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            {receiverName.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{receiverName}</h3>
        </div>
        <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${isConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`}
          />
          {isConnected ? "Connected" : "Connecting..."}
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id || idx}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 rounded-tl-sm border border-gray-100"
                  }`}
                >
                  {!isMe && (
                    <span className="block text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
                      {msg.sender_name || receiverName}
                    </span>
                  )}
                  <p className="text-[15px] leading-relaxed break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-gray-200"
      >
        <div className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isConnected ? "Type your message..." : "Waiting for connection..."
            }
            className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 text-gray-900 placeholder-gray-400"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
