import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: ReactNode;
}

export default function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-[#0052cc] hover:bg-[#0747a6] text-white font-medium shadow-sm",
    secondary: "bg-white hover:bg-[#f4f5f7] border border-[#dfe1e6] text-[#42526e] font-medium",
    danger: "bg-[#de350b] hover:bg-[#bf2600] text-white font-medium shadow-sm",
  };

  return (
    <button
      className={`px-3 py-1.5 rounded text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
