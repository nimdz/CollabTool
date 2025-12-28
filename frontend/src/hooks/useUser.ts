"use client";

import { useState, useEffect } from "react";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";

export interface User {
    username: string;
    fullName: string;
    email: string;
    bio?: string;
    department?: string;
    joinedAt?: string;
}

export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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
            } catch (err) {
                console.error(err);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { user, loading, error };
}
