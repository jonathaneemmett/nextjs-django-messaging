"use client";

import { useState } from "react";
import Link from "next/link";
import {
  useGetInboxQuery,
  useArchiveMessageMutation,
  useBulkMarkAsReadMutation,
} from "@/api/messagesApi";

export default function InboxPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading } = useGetInboxQuery({
    page,
    search: search || undefined,
  });
  const [archiveMessage] = useArchiveMessageMutation();
  const [bulkMarkAsRead] = useBulkMarkAsReadMutation();

  const messages = data?.results ?? [];

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === messages.length) {
      setSelected([]);
    } else {
      setSelected(messages.map((m) => m.id));
    }
  };

  const handleBulkRead = async () => {
    if (selected.length > 0) {
      await bulkMarkAsRead({ ids: selected });
      setSelected([]);
    }
  };

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
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
        {data && (
          <span className="text-xs text-gray-400 font-medium">
            {data.count} message{data.count !== 1 ? "s" : ""}
          </span>
        )}
        <div className="ml-auto relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-48 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 transition-colors"
          />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-3 px-6 py-2 bg-blue-50 border-b border-blue-100">
          <span className="text-xs font-medium text-blue-700">
            {selected.length} selected
          </span>
          <button
            onClick={handleBulkRead}
            className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Mark as read
          </button>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </div>
      )}

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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
            />
          </svg>
          <p className="text-sm text-gray-400">Your inbox is empty</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-center gap-3 px-6 py-3 hover:bg-white transition-colors cursor-pointer group ${
                  !message.is_read ? "bg-white" : ""
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(message.id)}
                  onChange={() => toggleSelect(message.id)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                />
                {!message.is_read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
                {message.is_read && <span className="h-2 w-2 flex-shrink-0" />}
                <span
                  className={`w-32 truncate text-sm flex-shrink-0 ${
                    !message.is_read
                      ? "font-semibold text-gray-900"
                      : "text-gray-600"
                  }`}
                >
                  {message.sender}
                </span>
                <Link
                  href={`/inbox/${message.id}`}
                  className="flex-1 min-w-0 flex items-baseline gap-2"
                >
                  <span
                    className={`truncate text-sm ${
                      !message.is_read
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {message.subject}
                  </span>
                  <span className="truncate text-xs text-gray-400 hidden sm:inline">
                    {message.body.length > 60
                      ? message.body.slice(0, 60) + "..."
                      : message.body}
                  </span>
                </Link>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    archiveMessage(message.id);
                  }}
                  title="Archive"
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity flex-shrink-0"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                  </svg>
                </button>
                <span className="text-xs text-gray-400 w-16 text-right flex-shrink-0">
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
