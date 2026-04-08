"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/evaluate": "Evaluate",
  "/applications": "Applications",
  "/pipeline": "Pipeline",
  "/compare": "Compare",
  "/interview-prep": "Interview Prep",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  for (const [path, title] of Object.entries(pageTitles)) {
    if (path !== "/" && pathname.startsWith(path)) return title;
  }
  return "Career Ops";
}

export function Header() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex items-center justify-between h-16 px-6 lg:px-8 border-b border-white/5 bg-white/[0.01] backdrop-blur-sm">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">
        {title}
      </h1>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Search bar */}
        <div className="relative hidden sm:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search applications..."
            className="
              w-64 h-9 pl-9 pr-3
              bg-white/5 border border-white/10 rounded-lg
              text-sm text-zinc-300 placeholder-zinc-600
              focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
              transition-all duration-150
            "
          />
        </div>

        {/* Notification bell */}
        <button
          className="relative p-2 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all duration-150"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-purple-600 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <span className="text-xs font-semibold text-white">U</span>
        </div>
      </div>
    </header>
  );
}
