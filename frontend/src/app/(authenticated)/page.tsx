"use client";

import { useAuth } from "@/hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600">
        <FontAwesomeIcon icon={faEnvelope} className="w-8 h-8" />
      </div>
      <h1 className="text-xl font-semibold text-gray-900">
        Welcome back{user ? `, ${user.username}` : ""}
      </h1>
      <p className="text-sm text-gray-500">
        Select a conversation from the sidebar or compose a new message.
      </p>
    </div>
  );
}
