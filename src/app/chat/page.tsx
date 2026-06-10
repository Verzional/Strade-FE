export default function ChatIndexPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
      <div className="text-center text-gray-500">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">Your Messages</h3>
        <p className="mt-1">
          Select a conversation from the sidebar to start chatting.
        </p>
      </div>
    </div>
  );
}
