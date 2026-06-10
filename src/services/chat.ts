import { ChatMessage, ChatContact } from "@/types/chat";

const CHAT_API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8081";

export const getChatHistory = async (
  senderId: string,
  receiverId: string,
): Promise<ChatMessage[]> => {
  try {
    const response = await fetch(
      `${CHAT_API_URL}/api/v1/chat/history?sender_id=${senderId}&receiver_id=${receiverId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch chat history");
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
};

export const getChatContacts = async (
  userId: string,
): Promise<ChatContact[]> => {
  try {
    const response = await fetch(
      `${CHAT_API_URL}/api/v1/chat/contacts?user_id=${userId}`,
    );
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat contacts:", error);
    return [];
  }
};
