"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { messagesApi } from "@/api/messagesApi";
import { showToast } from "@/components/ToastContainer";

export function useWebSocket() {
  const dispatch = useDispatch();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const pathnameRef = useRef("/");
  const pathname = usePathname();

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const connect = useCallback(() => {
    const tokens = localStorage.getItem("tokens");
    if (!tokens) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const { access } = JSON.parse(tokens);
    const defaultWsUrl = `ws://${window.location.host}/ws/notifications/`;
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL || defaultWsUrl;
    const wsUrl = `${baseUrl}?token=${access}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      dispatch(messagesApi.util.invalidateTags(["Messages", "UnreadCount"]));

      const data = JSON.parse(event.data);
      if (data.id && data.sender && data.subject) {
        if (!pathnameRef.current.startsWith("/inbox")) {
          showToast({
            id: data.id,
            sender: data.sender,
            subject: data.subject,
          });
        }
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (mountedRef.current && localStorage.getItem("tokens")) {
        reconnectTimeout.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = () => {
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
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
