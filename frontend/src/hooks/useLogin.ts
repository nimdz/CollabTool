"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { AxiosError } from "axios";
import toast from "react-hot-toast"; 


interface LoginForm {
    email: string;
    password: string;
}

interface ApiError {
    message: string;
}

export function useLogin() {
    const router = useRouter();
    const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post<{ token: string; refreshToken: string }>(
                "/auth/login",
                form
            );
            saveTokens(res.data.token, res.data.refreshToken);
            toast.success("Login successful!");
            router.push("/user/dashboard");
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            const message = axiosError.response?.data?.message || "Login failed.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, error, handleChange, handleSubmit };
}
