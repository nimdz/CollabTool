"use client";

import { AtSymbolIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import InputField from "@/components/auth/InputField";
import { useLogin } from "@/hooks/useLogin";
import { getToken } from "@/lib/auth";

export default function LoginPage() {
  const { form, loading, error, handleChange, handleSubmit } = useLogin();
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.push("/user/dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] px-4">
      <div className="max-w-md w-full bg-white rounded border border-[#dfe1e6] shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-[#172b4d] mb-2">Log in to CollabTool</h1>
          <p className="text-sm text-[#5e6c84]">Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            icon={<AtSymbolIcon className="w-5 h-5 text-[#5e6c84]" />}
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />

          <InputField
            icon={<LockClosedIcon className="w-5 h-5 text-[#5e6c84]" />}
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          {error && <p className="text-[#de350b] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0052cc] text-white py-2 rounded hover:bg-[#0747a6] transition text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="text-[#5e6c84] text-sm mt-6 text-center">
          Don't have an account?{" "}
          <Link href="/user/register" className="text-[#0052cc] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
