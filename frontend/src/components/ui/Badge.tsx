import { ReactNode } from "react";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "info";
  children: ReactNode;
}

export default function Badge({ variant = "default", children }: BadgeProps) {
  const variants = {
    default: "bg-[#dfe1e6] text-[#42526e]",
    success: "bg-[#e3fcef] text-[#006644]",
    warning: "bg-[#fff0b3] text-[#172b4d]",
    info: "bg-[#deebff] text-[#0052cc]",
  };

  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded uppercase ${variants[variant]}`}>
      {children}
    </span>
  );
}
