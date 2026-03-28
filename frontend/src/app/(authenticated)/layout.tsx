"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useGetUnreadCountQuery } from "@/api/messagesApi";

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

const inboxIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
  </svg>
);

const sentIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

const composeIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const signOutIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

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
        <NavItem href="/inbox" active={pathname.startsWith("/inbox")} badge={unread} label="Inbox" icon={inboxIcon} />
        <NavItem href="/sent" active={pathname.startsWith("/sent")} label="Sent" icon={sentIcon} />
        <NavItem href="/compose" active={pathname.startsWith("/compose")} label="Compose" icon={composeIcon} />
      </nav>

      <div className="flex flex-col items-center gap-2">
        <button
          onClick={logout}
          title="Sign out"
          className="flex items-center justify-center w-10 h-10 rounded-lg text-slate-400 hover:bg-white/8 hover:text-slate-200 transition-colors"
        >
          {signOutIcon}
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
      <MobileNavItem href="/inbox" active={pathname.startsWith("/inbox")} badge={unread} label="Inbox" icon={inboxIcon} />
      <MobileNavItem href="/sent" active={pathname.startsWith("/sent")} label="Sent" icon={sentIcon} />
      <MobileNavItem href="/compose" active={pathname.startsWith("/compose")} label="Compose" icon={composeIcon} />
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
      <main className="flex-1 overflow-auto bg-gray-50 pb-16 md:pb-0">{children}</main>
      <MobileBottomNav />
    </div>
  );
}
