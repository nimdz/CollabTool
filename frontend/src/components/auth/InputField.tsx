import React from "react";

interface InputProps {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  textarea?: boolean;
}

export default function InputField({
  label,
  type = "text",
  name,
  value,
  onChange,
  icon,
  disabled = false,
  textarea = false,
}: InputProps) {
  const baseClasses =
    "w-full rounded border border-[#dfe1e6] text-[#172b4d] placeholder-[#5e6c84] focus:outline-none focus:border-[#0052cc] focus:bg-white " +
    (disabled ? "bg-[#f4f5f7] cursor-not-allowed" : "bg-[#fafbfc]") +
    (icon ? " pl-10" : " pl-3");

  if (textarea) {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
          {label}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={label}
          className={`${baseClasses} py-2 px-3 resize-none text-sm`}
          rows={4}
        />
      </div>
    );
  }

  return (
    <div className="mb-4 relative">
      <label htmlFor={name} className="block text-xs font-semibold text-[#5e6c84] mb-1 uppercase">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={label}
          disabled={disabled}
          className={baseClasses + " py-2 px-3 text-sm"}
        />
      </div>
    </div>
  );
}
