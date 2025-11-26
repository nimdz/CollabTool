"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";

interface User {
  username: string;
  fullName: string;
  email: string;
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      logout();
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await api.get<User>("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        logout();
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopBar user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-white">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-[#dfe1e6]">
      <nav className="py-2">
        <SidebarItem label="Dashboard" href="/user/dashboard" icon="🏠" />
        <SidebarItem label="Projects" href="/user/projects" icon="📋" />
        <SidebarItem label="My Tasks" href="/user/tasks" icon="✓" />
      </nav>
    </aside>
  );
}

function SidebarItem({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 mx-2 text-[#42526e] hover:bg-[#f4f5f7] rounded text-sm font-medium transition"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function TopBar({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-[#dfe1e6] flex items-center px-6 gap-4 shadow-sm">
      <Link href="/user/dashboard" className="font-bold text-xl text-[#0052cc]">
        CollabTool
      </Link>

      <nav className="flex items-center gap-1 ml-4">
        <Link href="/user/projects" className="px-3 py-1.5 text-sm font-medium text-[#42526e] hover:bg-[#f4f5f7] rounded">
          Projects
        </Link>
        <Link href="/user/tasks" className="px-3 py-1.5 text-sm font-medium text-[#42526e] hover:bg-[#f4f5f7] rounded">
          Tasks
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center hover:bg-[#f4f5f7] rounded">
          <span className="text-[#42526e]">🔔</span>
        </button>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 bg-[#0052cc] text-white rounded-full flex items-center justify-center text-sm font-medium hover:bg-[#0747a6]"
          >
            {user?.fullName?.charAt(0) || "U"}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#dfe1e6] rounded shadow-lg z-50">
              <div className="px-4 py-3 border-b border-[#dfe1e6]">
                <p className="text-sm font-semibold text-[#172b4d]">{user?.fullName}</p>
                <p className="text-xs text-[#5e6c84]">{user?.email}</p>
              </div>
              <Link href="/user/profile" className="block px-4 py-2 text-sm text-[#42526e] hover:bg-[#f4f5f7]">
                Profile
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-[#42526e] hover:bg-[#f4f5f7] border-t border-[#dfe1e6]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
