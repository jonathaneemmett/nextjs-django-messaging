"use client";

import { useState } from "react";
import { useGetSentMessagesQuery } from "@/api/messagesApi";

export default function SentPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSentMessagesQuery({ page });

  const messages = data?.results ?? [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 md:px-6 py-3 md:py-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Sent</h2>
        {data && (
          <span className="text-xs text-gray-400 font-medium">
            {data.count} message{data.count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2">
          <svg
            className="w-12 h-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <p className="text-sm text-gray-400">No sent messages</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-center gap-2 md:gap-3 px-3 md:px-6 py-3 hover:bg-white transition-colors"
              >
                <span className="w-20 md:w-32 truncate text-sm text-gray-600 flex-shrink-0">
                  To: User {message.recipient}
                </span>
                <span className="flex-1 truncate text-sm text-gray-700">
                  {message.subject}
                </span>
                <span className="text-xs text-gray-400 w-12 md:w-16 text-right flex-shrink-0">
                  {formatDate(message.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data && (data.next || data.previous) && (
        <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-400">Page {page}</span>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
