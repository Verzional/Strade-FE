"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchWithAuth } from "../../../lib/api";
import { getChatContacts } from "@/services/chat";
import { ChatContact } from "@/types/chat";
import NewChatModal from "@/components/NewChatModal"; // <-- IMPORT THE MODAL

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- MODAL STATE

  useEffect(() => {
    const loadSidebar = async () => {
      try {
        const profileRes = await fetchWithAuth("/api/users/profile");
        if (profileRes.status === 401) {
          router.replace("/login");
          return;
        }
        if (!profileRes.ok) throw new Error("Failed to load profile");

        const userData = await profileRes.json();
        const recentContacts = await getChatContacts(userData.id);
        setContacts(recentContacts);
      } catch (error) {
        console.error("Failed to load chat sidebar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSidebar();
  }, [router]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4 max-w-sm bg-white border-r border-gray-200 flex flex-col hidden md:flex">
          {/* Sidebar Header with New Chat Button */}
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
              title="New Chat"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No recent conversations. Click the + icon to start one!
              </div>
            ) : (
              contacts.map((contact) => {
                const isActive = pathname === `/chat/${contact.id}`;
                return (
                  <li key={contact.id}>
                    <Link
                      href={`/chat/${contact.id}`}
                      className={`flex items-center gap-3 p-4 hover:bg-blue-50 transition-colors ${
                        isActive
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : "border-l-4 border-transparent"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-gray-900 truncate">
                          {contact.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          Tap to open chat...
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col relative bg-gray-50">
          {children}
        </main>
      </div>

      {/* Render the Modal */}
      <NewChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
