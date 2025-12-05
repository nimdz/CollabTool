"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f5f7] flex flex-col">
      <header className="bg-white border-b border-[#dfe1e6] px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#0052cc]">CollabTool</h1>
          <nav className="flex gap-3">
            {isLoggedIn ? (
              <Link
                href="/user/dashboard"
                className="px-4 py-2 text-sm font-medium bg-[#0052cc] text-white rounded hover:bg-[#0747a6]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/user/login"
                  className="px-4 py-2 text-sm font-medium text-[#42526e] hover:text-[#172b4d]"
                >
                  Log in
                </Link>
                <Link
                  href="/user/register"
                  className="px-4 py-2 text-sm font-medium bg-[#0052cc] text-white rounded hover:bg-[#0747a6]"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-[#172b4d] mb-4">
          Team collaboration made simple
        </h2>
        <p className="text-lg text-[#5e6c84] max-w-2xl mb-8">
          Manage projects, track tasks, and collaborate with your team in real-time.
          Everything you need in one place.
        </p>
        <div className="flex gap-3">
          <Link
            href="/user/register"
            className="px-6 py-3 bg-[#0052cc] text-white rounded font-medium hover:bg-[#0747a6] shadow-sm"
          >
            Get started
          </Link>
          <Link
            href="/user/login"
            className="px-6 py-3 border border-[#dfe1e6] text-[#42526e] rounded font-medium hover:bg-white shadow-sm"
          >
            Log in
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="p-6 bg-white rounded border border-[#dfe1e6] shadow-sm">
            <h3 className="text-lg font-semibold text-[#172b4d] mb-2">Project Management</h3>
            <p className="text-sm text-[#5e6c84]">
              Organize work, set priorities, and track progress across all your projects.
            </p>
          </div>
          <div className="p-6 bg-white rounded border border-[#dfe1e6] shadow-sm">
            <h3 className="text-lg font-semibold text-[#172b4d] mb-2">Real-time Collaboration</h3>
            <p className="text-sm text-[#5e6c84]">
              Work together seamlessly with instant updates and live meetings.
            </p>
          </div>
          <div className="p-6 bg-white rounded border border-[#dfe1e6] shadow-sm">
            <h3 className="text-lg font-semibold text-[#172b4d] mb-2">Task Tracking</h3>
            <p className="text-sm text-[#5e6c84]">
              Keep everyone aligned with clear task assignments and status updates.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[#dfe1e6] py-6 text-center text-sm text-[#5e6c84]">
        &copy; {new Date().getFullYear()} CollabTool. All rights reserved.
      </footer>
    </div>
  );
}
