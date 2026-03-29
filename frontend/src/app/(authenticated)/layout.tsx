"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useGetUnreadCountQuery } from "@/api/messagesApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faInbox,
  faPaperPlane,
  faPenToSquare,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import ToastContainer from "@/components/ToastContainer";

function NavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      title={label}
      className={`relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
        active
          ? "bg-white/15 text-white md:text-white text-blue-500 md:bg-white/15 bg-transparent"
          : "text-slate-400 hover:bg-white/8 hover:text-slate-200 md:hover:bg-white/8 md:hover:text-slate-200"
      }`}
    >
      {icon}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function MobileNavItem({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors ${
        active ? "text-blue-600" : "text-gray-400"
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

function DesktopSidebar() {
  const pathname = usePathname();
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { user, logout } = useAuth();
  const unread = unreadData?.unread_count ?? 0;

  return (
    <aside className="hidden md:flex flex-col items-center w-16 bg-[var(--sidebar-bg)] py-4 gap-2 flex-shrink-0">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white font-bold text-sm mb-4">
        M
      </div>

      <nav className="flex flex-col items-center gap-1.5 flex-1">
        <NavItem
          href="/"
          active={pathname === "/"}
          label="Home"
          icon={<FontAwesomeIcon icon={faHouse} className="w-5 h-5" />}
        />
        <NavItem
          href="/inbox"
          active={pathname.startsWith("/inbox")}
          badge={unread}
          label="Inbox"
          icon={<FontAwesomeIcon icon={faInbox} className="w-5 h-5" />}
        />
        <NavItem
          href="/sent"
          active={pathname.startsWith("/sent")}
          label="Sent"
          icon={<FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />}
        />
        <NavItem
          href="/compose"
          active={pathname.startsWith("/compose")}
          label="Compose"
          icon={<FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5" />}
        />
      </nav>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={logout}
          title="Sign out"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-colors"
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="w-5 h-5" />
        </button>
        {user && (
          <div
            title={user.username}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-600 text-xs font-medium text-white"
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </aside>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unread = unreadData?.unread_count ?? 0;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-1 z-50 safe-area-bottom">
      <MobileNavItem
        href="/"
        active={pathname === "/"}
        label="Home"
        icon={<FontAwesomeIcon icon={faHouse} className="w-5 h-5" />}
      />
      <MobileNavItem
        href="/inbox"
        active={pathname.startsWith("/inbox")}
        badge={unread}
        label="Inbox"
        icon={<FontAwesomeIcon icon={faInbox} className="w-5 h-5" />}
      />
      <MobileNavItem
        href="/sent"
        active={pathname.startsWith("/sent")}
        label="Sent"
        icon={<FontAwesomeIcon icon={faPaperPlane} className="w-5 h-5" />}
      />
      <MobileNavItem
        href="/compose"
        active={pathname.startsWith("/compose")}
        label="Compose"
        icon={<FontAwesomeIcon icon={faPenToSquare} className="w-5 h-5" />}
      />
    </nav>
  );
}

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isLoading } = useAuth();

  useWebSocket();

  useEffect(() => {
    const tokens = localStorage.getItem("tokens");
    if (!tokens) {
      router.push("/auth/login");
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <DesktopSidebar />
      <main className="flex-1 overflow-auto bg-gray-50 pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomNav />
      <ToastContainer />
    </div>
  );
}
