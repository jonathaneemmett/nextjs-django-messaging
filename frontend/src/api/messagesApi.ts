import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithTokenHandling } from "./baseQuery";

export interface Message {
  id: number;
  sender: string;
  recipient: number;
  subject: string;
  body: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Message[];
}

interface UnreadCount {
  unread_count: number;
}

export const messagesApi = createApi({
  reducerPath: "messagesApi",
  baseQuery: baseQueryWithTokenHandling,
  tagTypes: ["Messages", "SentMessages", "UnreadCount"],
  endpoints: (builder) => ({
    getInbox: builder.query<
      PaginatedResponse,
      { page?: number; search?: string; is_read?: boolean } | void
    >({
      query: (params) => ({
        url: "/api/messages/",
        params: params || undefined,
      }),
      providesTags: ["Messages"],
    }),
    getSentMessages: builder.query<
      PaginatedResponse,
      { page?: number } | void
    >({
      query: (params) => ({
        url: "/api/messages/sent/",
        params: params || undefined,
      }),
      providesTags: ["SentMessages"],
    }),
    getUnreadCount: builder.query<UnreadCount, void>({
      query: () => "/api/messages/unread-count/",
      providesTags: ["UnreadCount"],
    }),
    sendMessage: builder.mutation<
      Message,
      { recipient: number; subject: string; body: string }
    >({
      query: (body) => ({
        url: "/api/messages/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SentMessages"],
    }),
    markAsRead: builder.mutation<Message, number>({
      query: (id) => ({
        url: `/api/messages/${id}/mark-read/`,
        method: "PATCH",
      }),
      invalidatesTags: ["Messages", "UnreadCount"],
    }),
    bulkMarkAsRead: builder.mutation<{ updated: number }, { ids: number[] }>({
      query: (body) => ({
        url: "/api/messages/mark-read/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Messages", "UnreadCount"],
    }),
    archiveMessage: builder.mutation<Message, number>({
      query: (id) => ({
        url: `/api/messages/${id}/`,
        method: "PATCH",
      }),
      invalidatesTags: ["Messages", "UnreadCount"],
    }),
    deleteMessage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/messages/${id}/`,
        method: "DELETE",
      }),
      invalidatesTags: ["Messages", "UnreadCount"],
    }),
  }),
});

export const {
  useGetInboxQuery,
  useGetSentMessagesQuery,
  useGetUnreadCountQuery,
  useSendMessageMutation,
  useMarkAsReadMutation,
  useBulkMarkAsReadMutation,
  useArchiveMessageMutation,
  useDeleteMessageMutation,
} = messagesApi;
