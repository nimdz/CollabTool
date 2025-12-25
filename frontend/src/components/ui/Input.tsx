import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
          {label}
        </label>
      )}
      <input
        className={`w-full px-2 py-1.5 text-sm border border-[#dfe1e6] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white ${
          error ? "border-[#de350b]" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#de350b] mt-1">{error}</p>}
    </div>
  );
}
