"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetInboxQuery,
  useMarkAsReadMutation,
  useArchiveMessageMutation,
  useDeleteMessageMutation,
} from "@/api/messagesApi";

export default function MessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data } = useGetInboxQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [archiveMessage] = useArchiveMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  const message = data?.results.find((m) => m.id === Number(id));

  useEffect(() => {
    if (message && !message.is_read) {
      markAsRead(message.id);
    }
  }, [message, markAsRead]);

  if (!message) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-gray-400">Message not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-200">
        <button
          onClick={() => router.push("/inbox")}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back
        </button>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={async () => {
              await archiveMessage(message.id);
              router.push("/inbox");
            }}
            title="Archive"
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </button>
          <button
            onClick={async () => {
              await deleteMessage(message.id);
              router.push("/inbox");
            }}
            title="Delete"
            className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {message.subject}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {message.sender.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {message.sender}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(message.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <hr className="my-5 border-gray-100" />
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {message.body}
        </div>
      </div>
    </div>
  );
}
