"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthUser {
  username: string;
}

interface Tokens {
  access: string;
  refresh: string;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      const parsed: Tokens = JSON.parse(tokens);
      // Decode the JWT payload to get the username
      try {
        const payload = JSON.parse(atob(parsed.access.split(".")[1]));
        setUser({ username: payload.user_id?.toString() || "User" });
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (tokens: Tokens, username: string) => {
    localStorage.setItem("tokens", JSON.stringify(tokens));
    setUser({ username });
  };

  const logout = () => {
    localStorage.removeItem("tokens");
    setUser(null);
    router.push("/auth/login");
  };

  return { user, isLoading, login, logout };
}
