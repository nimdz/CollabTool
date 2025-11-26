"use client";

import React from "react";

export default function AuthCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-md border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">{title}</h2>
                {children}
            </div>
        </div>
    );
}
