"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { messagesApi } from "@/api/messagesApi";

export function useWebSocket() {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    // Don't connect if no tokens
    const tokens = localStorage.getItem("tokens");
    if (!tokens) return;

    // Don't connect if already connected
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const { access } = JSON.parse(tokens);
    const baseUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/notifications/";
    const wsUrl = `${baseUrl}?token=${access}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = () => {
      dispatch(messagesApi.util.invalidateTags(["Messages", "UnreadCount"]));
    };

    ws.onclose = () => {
      wsRef.current = null;
      // Only reconnect if still mounted and has tokens
      if (mountedRef.current && localStorage.getItem("tokens")) {
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
      // Let onclose handle reconnection
      ws.close();
    };
  }, [dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on unmount
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
