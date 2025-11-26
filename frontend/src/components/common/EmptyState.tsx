import { ReactNode } from "react";

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16">
      <div className="w-16 h-16 bg-[#f4f5f7] rounded-full flex items-center justify-center mb-4">
        <span className="text-3xl text-[#a5adba]">📋</span>
      </div>
      <p className="text-[#5e6c84] mb-4">{message}</p>
      {action}
    </div>
  );
}
