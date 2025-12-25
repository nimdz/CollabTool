"use client";

import { useState, useEffect } from "react";
import { getToken, logout } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast"; 

export interface UserProfile {
    username: string;
    fullName: string;
    email: string;
    bio?: string;
    department?: string;
    joinedAt: string;
    role: string;
}

export function useProfile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({ fullName: "", bio: "", department: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Fetch profile from backend
    const fetchProfile = async () => {
        const token = getToken();
        if (!token) return logout();

        try {
            const res = await api.get<UserProfile>("/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(res.data);
            setForm({
                fullName: res.data.fullName,
                bio: res.data.bio || "",
                department: res.data.department || "",
            });
        } catch (err) {
            console.error(err);
            setError("Failed to fetch profile.");
            toast.error("Failed to fetch profile.");
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Save profile with toast notifications
    const handleSave = async () => {
        setSaving(true);
        setError("");

        try {
            const token = getToken();
            if (!token) return logout();

            const res = await api.put("/profile/update", form, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(res.data.user || res.data); 
            setEditMode(false);
            toast.success("Profile updated successfully!"); 
        } catch (err) {
            console.error(err);
            setError("Failed to update profile.");
            toast.error("Failed to update profile."); 
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    return { user, loading, editMode, setEditMode, form, handleChange, handleSave, saving, error };
}
