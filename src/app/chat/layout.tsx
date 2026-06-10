// src/app/chat/layout.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { fetchWithAuth } from "../../../lib/api";
import { getChatContacts } from "@/services/chat";
import { ChatContact } from "@/types/chat";
import Navbar from "../components/Navbar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSidebar = async () => {
      try {
        // 1. Get Logged In User
        const profileRes = await fetchWithAuth("/api/users/profile");
        if (profileRes.status === 401) {
          router.replace("/login");
          return;
        }
        if (!profileRes.ok) throw new Error("Failed to load profile");

        const userData = await profileRes.json();

        // 2. Fetch their chat contacts using the new Chat Service endpoint
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
      <Navbar />

      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Sidebar */}
        <aside className="w-full md:w-1/3 lg:w-1/4 max-w-sm bg-white border-r border-gray-200 flex flex-col hidden md:flex">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Messages</h2>
          </div>

          <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No recent conversations.
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
    </div>
  );
}
