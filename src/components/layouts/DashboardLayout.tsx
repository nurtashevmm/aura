"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FaSignOutAlt } from "react-icons/fa";

export interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface Props {
  links: SidebarLink[];
  onLogout?: () => void;
  children: React.ReactNode;
}

/*
 * Universal dashboard layout with a neumorphic sidebar on the left and main content area.
 * Re-used by Player and Merchant areas.
 */
export default function DashboardLayout({ links, onLogout, children }: Props) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0d0d0f] via-[#121214] to-[#1a1a1d] text-white">
      <aside className="w-60 p-6 shadow-neo-in glass-bg flex flex-col gap-4">
        <h2 className="text-xl font-bold mb-6">AURA Play</h2>
        <nav className="flex-1 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                pathname.startsWith(l.href)
                  ? "bg-[#FFB648] text-black shadow-neo-in"
                  : "hover:bg-zinc-800"
              )}
            >
              {l.icon && <span className="text-lg">{l.icon}</span>}
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>
        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-auto flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800"
          >
            <FaSignOutAlt /> Выйти
          </button>
        )}
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
