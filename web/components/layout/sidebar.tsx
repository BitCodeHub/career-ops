"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ListChecks,
  GitBranch,
  BarChart3,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/evaluate", label: "Evaluate", icon: Search },
  { href: "/applications", label: "Applications", icon: ListChecks },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/compare", label: "Compare", icon: BarChart3 },
  { href: "/interview-prep", label: "Interview Prep", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`
        relative flex flex-col h-screen sticky top-0
        border-r border-white/5
        bg-white/[0.02] backdrop-blur-xl
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[72px]" : "w-[260px]"}
      `}
    >
      {/* Brand */}
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold tracking-tight whitespace-nowrap gradient-text-cyan-purple">
              Career Ops
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-sm font-medium
                transition-all duration-150
                group
                ${
                  isActive
                    ? "bg-white/[0.08] text-cyan-400 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                }
                ${collapsed ? "justify-center" : ""}
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                size={20}
                className={`flex-shrink-0 transition-colors duration-150 ${
                  isActive
                    ? "text-cyan-400"
                    : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/5">
        {!collapsed && (
          <div className="px-3 mb-3">
            <p className="text-[11px] text-zinc-600 font-mono">
              Career Ops v0.1.0
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            flex items-center gap-3 w-full px-3 py-2 rounded-lg
            text-sm text-zinc-500 hover:text-zinc-300
            hover:bg-white/[0.04] transition-all duration-150
            ${collapsed ? "justify-center" : ""}
          `}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
