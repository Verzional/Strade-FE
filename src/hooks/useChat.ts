import { useState, useEffect, useCallback, useRef } from "react";
import { ChatMessage } from "../types/chat";

// Point directly to the Chat Microservice
const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8081";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8081/ws";

export const useChat = (
  currentUserId: string | undefined,
  receiverId: string,
) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  // 1. Fetch History via REST
  useEffect(() => {
    if (!currentUserId || !receiverId) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(
          `${CHAT_API_URL}/api/v1/chat/history?sender_id=${currentUserId}&receiver_id=${receiverId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      }
    };

    fetchHistory();
  }, [currentUserId, receiverId]);

  // 2. Manage WebSocket Connection
  useEffect(() => {
    if (!currentUserId) return;

    const connectWs = () => {
      ws.current = new WebSocket(`${WS_URL}?user_id=${currentUserId}`);

      ws.current.onopen = () => setIsConnected(true);

      ws.current.onclose = () => {
        setIsConnected(false);
        // Auto-reconnect after 3 seconds if dropped
        setTimeout(connectWs, 3000);
      };

      ws.current.onmessage = (event) => {
        const newMessage: ChatMessage = JSON.parse(event.data);
        // Only append if the message belongs to this specific conversation
        if (
          newMessage.sender_id === receiverId ||
          newMessage.receiver_id === receiverId
        ) {
          setMessages((prev) => [...prev, newMessage]);
        }
      };
    };

    connectWs();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [currentUserId, receiverId]);

  // 3. Send Message Function
  const sendMessage = useCallback(
    (content: string) => {
      if (ws.current?.readyState === WebSocket.OPEN && currentUserId) {
        ws.current.send(JSON.stringify({ receiver_id: receiverId, content }));

        // Optimistic UI update
        setMessages((prev) => [
          ...prev,
          {
            sender_id: currentUserId,
            receiver_id: receiverId,
            content,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    },
    [currentUserId, receiverId],
  );

  return { messages, sendMessage, isConnected };
};
