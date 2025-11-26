import React from "react";

export default function SubmitButton({ label, loading }: { label: string; loading?: boolean }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
        >
            {loading ? "Processing..." : label}
        </button>
    );
}
