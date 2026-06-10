export interface ChatMessage {
  id?: string;
  sender_id: string;
  sender_name?: string;
  receiver_id: string;
  content: string;
  created_at?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  image?: string;
}
