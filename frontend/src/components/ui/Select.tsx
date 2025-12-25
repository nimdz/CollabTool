import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className = "", ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
          {label}
        </label>
      )}
      <select
        className={`w-full px-2 py-1.5 text-sm border border-[#dfe1e6] rounded bg-[#fafbfc] focus:outline-none focus:border-[#0052cc] focus:bg-white ${
          error ? "border-[#de350b]" : ""
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-[#de350b] mt-1">{error}</p>}
    </div>
  );
}
